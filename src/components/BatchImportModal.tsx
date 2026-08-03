import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import styled from 'styled-components';
import { DEFAULT_SKILL, SKILL_OPTIONS } from '../constants/skill';
import type { SkillLevel } from '../types';
import { cropImageToBlob } from '../utils/cropImage';
import { recognizeRosterNames } from '../utils/ocrRoster';
import { parseTypedNames } from '../utils/parseRosterText';

type DraftRow = {
  id: string;
  name: string;
};

type Step = 'upload' | 'crop' | 'review';

type Props = {
  open: boolean;
  existingNames: string[];
  onClose: () => void;
  onConfirm: (names: string[], skill: SkillLevel) => void;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.72);
`;

const Modal = styled.div`
  width: min(560px, 100%);
  max-height: min(88vh, 820px);
  overflow: auto;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: ${({ theme }) => theme.shadows.glow};
`;

const Title = styled.h2`
  margin: 0 0 0.35rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.8rem;
  letter-spacing: 0.05em;
  font-weight: 400;
`;

const Hint = styled.p`
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
  line-height: 1.45;
`;

const DropZone = styled.label<{ $dragging: boolean; $disabled: boolean }>`
  display: grid;
  place-items: center;
  gap: 0.35rem;
  min-height: 140px;
  padding: 1rem;
  border: 1px dashed
    ${({ theme, $dragging }) =>
      $dragging ? theme.colors.accent : theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $dragging }) =>
    $dragging ? theme.colors.accentSoft : theme.colors.bg};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  cursor: ${({ $disabled }) => ($disabled ? 'wait' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;

const HiddenInput = styled.input`
  display: none;
`;

const CropWrap = styled.div`
  position: relative;
  width: 100%;
  height: min(48vh, 360px);
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: #000;
`;

const ZoomRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.88rem;
`;

const ZoomInput = styled.input`
  flex: 1;
  accent-color: ${({ theme }) => theme.colors.accent};
`;

const Preview = styled.img`
  max-width: 100%;
  max-height: 160px;
  border-radius: ${({ theme }) => theme.radii.sm};
  object-fit: contain;
`;

const ProgressBox = styled.div`
  margin-top: 0.85rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg};
`;

const ProgressTrack = styled.div`
  height: 6px;
  margin-top: 0.45rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $value: number }>`
  width: ${({ $value }) => `${Math.round($value * 100)}%`};
  height: 100%;
  background: ${({ theme }) => theme.colors.accent};
  transition: width 0.2s ease;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin: 1rem 0 0.65rem;
`;

const Select = styled.select`
  min-height: 40px;
  padding: 0.45rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  max-height: 240px;
  overflow: auto;
`;

const Row = styled.li`
  display: flex;
  gap: 0.45rem;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  min-height: 40px;
  padding: 0.5rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.55rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  min-height: 42px;
  padding: 0.65rem 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.border : theme.colors.accent};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;

  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.bgHover : theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  margin: 0.75rem 0 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.88rem;
`;

const Empty = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.88rem;
`;

const PreviewBox = styled.div`
  display: grid;
  place-items: center;
  gap: 0.35rem;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.1rem 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 0.75rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  line-height: 1.45;
  resize: vertical;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

function createRow(name = ''): DraftRow {
  return {
    id: crypto.randomUUID(),
    name,
  };
}

function revokeUrl(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}

export function BatchImportModal({
  open,
  existingNames,
  onClose,
  onConfirm,
}: Props) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [typedText, setTypedText] = useState('');
  const [skill, setSkill] = useState<SkillLevel>(DEFAULT_SKILL);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const replaceSourceUrl = useCallback((next: string | null) => {
    setSourceUrl((prev) => {
      if (prev && prev !== next) revokeUrl(prev);
      return next;
    });
  }, []);

  const replaceProcessedUrl = useCallback((next: string | null) => {
    setProcessedUrl((prev) => {
      if (prev && prev !== next) revokeUrl(prev);
      return next;
    });
  }, []);

  const resetState = useCallback(() => {
    setStep('upload');
    setDragging(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setRows([]);
    setTypedText('');
    setSkill(DEFAULT_SKILL);
    setBusy(false);
    setProgress(0);
    setStatus('');
    setError('');
    replaceSourceUrl(null);
    replaceProcessedUrl(null);
  }, [replaceProcessedUrl, replaceSourceUrl]);

  useEffect(() => {
    if (open) {
      resetState();
      return;
    }

    // 닫힐 때만 정리. deps cleanup에서 revoke하면 Strict Mode/OCR 중
    // 아직 쓰는 sourceUrl까지 폐기되어 흰 화면이 납니다.
    replaceSourceUrl(null);
    replaceProcessedUrl(null);
  }, [open, replaceProcessedUrl, replaceSourceUrl, resetState]);

  const handleCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const applyTypedNames = useCallback(() => {
    const names = parseTypedNames(typedText);
    if (names.length === 0) {
      setError('콤마 또는 띄어쓰기로 이름을 입력해주세요. 예: 김철수 이영희');
      return;
    }

    setError('');
    replaceSourceUrl(null);
    replaceProcessedUrl(null);
    setCroppedAreaPixels(null);
    setRows(names.map((name) => createRow(name)));
    setStep('review');
  }, [replaceProcessedUrl, replaceSourceUrl, typedText]);

  if (!open) return null;

  const loadSourceFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setError('');
    setRows([]);
    replaceProcessedUrl(null);
    replaceSourceUrl(nextUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setStep('crop');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) loadSourceFile(file);
  };

  const runOcr = async (mode: 'crop' | 'full') => {
    if (!sourceUrl || busy) return;
    if (mode === 'crop' && !croppedAreaPixels) return;

    setError('');
    setBusy(true);
    setProgress(0);
    setStatus(
      mode === 'crop' ? '선택한 영역 자르는 중...' : '이미지 준비 중...',
    );

    try {
      const ocrSource =
        mode === 'crop' && croppedAreaPixels
          ? await cropImageToBlob(sourceUrl, croppedAreaPixels)
          : sourceUrl;

      setStatus('이미지 전처리 중...');

      const { names, previewUrl } = await recognizeRosterNames(
        ocrSource,
        (event) => {
          setStatus(event.status);
          setProgress(event.progress);
        },
      );

      replaceProcessedUrl(previewUrl);

      if (names.length === 0) {
        setRows([]);
        setError(
          mode === 'crop'
            ? '이름을 찾지 못했습니다. 이름 텍스트만 남도록 영역을 다시 잡아주세요.'
            : '이름을 찾지 못했습니다. 이름 영역만 크롭해 다시 시도해보세요.',
        );
      } else {
        setRows(names.map((name) => createRow(name)));
      }

      setStep('review');
    } catch (ocrError) {
      console.error(ocrError);
      setError('OCR 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
      setStatus('');
      setProgress(0);
    }
  };

  const validNames = rows.map((row) => row.name.trim()).filter(Boolean);
  const duplicateCount = validNames.filter((name) =>
    existingNames.some(
      (existing) => existing.toLowerCase() === name.toLowerCase(),
    ),
  ).length;

  const handleConfirm = () => {
    if (validNames.length === 0 || busy) return;
    onConfirm(validNames, skill);
    onClose();
  };

  return (
    <Overlay
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <Modal role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <Title id={titleId}>명단 일괄 등록</Title>

        {step === 'upload' && (
          <>
            <Hint>
              이름을 콤마나 띄어쓰기로 구분해 직접 입력하거나, 명단 이미지로 OCR
              등록할 수 있습니다.
            </Hint>

            <TextArea
              value={typedText}
              disabled={busy}
              placeholder="예: 김철수 이영희 박민수 또는 김철수, 이영희"
              aria-label="콤마 또는 띄어쓰기로 구분한 이름 목록"
              onChange={(event) => {
                setTypedText(event.target.value);
                if (error) setError('');
              }}
            />

            {error && <ErrorText>{error}</ErrorText>}

            <Footer style={{ marginTop: '0.75rem' }}>
              <Button
                type="button"
                disabled={busy || !typedText.trim()}
                onClick={applyTypedNames}
              >
                입력한 이름 확인
              </Button>
            </Footer>

            <Divider>또는 이미지로 등록</Divider>

            <DropZone
              $dragging={dragging}
              $disabled={busy}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) loadSourceFile(file);
              }}
            >
              <HiddenInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <strong style={{ color: '#f2f2f2' }}>이미지 선택 또는 드래그</strong>
              <span>PNG, JPG, WEBP 등 · 크롭은 선택</span>
            </DropZone>
          </>
        )}

        {step === 'crop' && sourceUrl && (
          <>
            <Hint>
              필요하면 이름 목록만 남기도록 영역을 맞춘 뒤{' '}
              <strong>이 영역으로 인식</strong>을 누르세요. 크롭이 필요 없으면{' '}
              <strong>전체로 인식</strong>을 선택하면 됩니다.
            </Hint>

            <CropWrap>
              <Cropper
                image={sourceUrl}
                crop={crop}
                zoom={zoom}
                rotation={0}
                aspect={3 / 4}
                minZoom={1}
                maxZoom={4}
                objectFit="contain"
                showGrid
                style={{ containerStyle: { height: '100%', width: '100%' } }}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </CropWrap>

            <ZoomRow>
              확대
              <ZoomInput
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                disabled={busy}
                onChange={(event) => setZoom(Number(event.target.value))}
                aria-label="크롭 확대"
              />
            </ZoomRow>

            {busy && (
              <ProgressBox>
                <div>{status || '인식 중...'}</div>
                <ProgressTrack>
                  <ProgressBar $value={progress} />
                </ProgressTrack>
              </ProgressBox>
            )}

            {error && <ErrorText>{error}</ErrorText>}

            <Footer>
              <Button
                type="button"
                $variant="ghost"
                disabled={busy}
                onClick={() => {
                  resetState();
                }}
              >
                다시 선택
              </Button>
              <Button
                type="button"
                $variant="ghost"
                disabled={busy}
                onClick={() => void runOcr('full')}
              >
                전체로 인식
              </Button>
              <Button
                type="button"
                disabled={busy || !croppedAreaPixels}
                onClick={() => void runOcr('crop')}
              >
                이 영역으로 인식
              </Button>
            </Footer>
          </>
        )}

        {step === 'review' && (
          <>
            <Hint>
              결과를 확인·수정한 뒤 등록하세요. 잘못됐다면 다시 입력하거나 이미지로
              다시 인식할 수 있습니다.
            </Hint>

            {processedUrl && (
              <PreviewBox>
                <Preview src={processedUrl} alt="전처리된 명단 미리보기" />
                <span>전처리된 이미지 미리보기</span>
              </PreviewBox>
            )}

            {error && <ErrorText>{error}</ErrorText>}

            <Toolbar>
              <Select
                value={skill}
                disabled={busy}
                onChange={(event) =>
                  setSkill(Number(event.target.value) as SkillLevel)
                }
                aria-label="기본 실력"
              >
                {SKILL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    기본 실력 {option.label}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                $variant="ghost"
                disabled={busy}
                onClick={() => setRows((prev) => [...prev, createRow()])}
              >
                이름 추가
              </Button>
            </Toolbar>

            {rows.length === 0 ? (
              <Empty>인식된 이름이 없습니다.</Empty>
            ) : (
              <List>
                {rows.map((row, index) => (
                  <Row key={row.id}>
                    <Input
                      value={row.name}
                      disabled={busy}
                      aria-label={`이름 ${index + 1}`}
                      onChange={(event) => {
                        const value = event.target.value;
                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id ? { ...item, name: value } : item,
                          ),
                        );
                      }}
                    />
                    <IconButton
                      type="button"
                      aria-label="행 삭제"
                      disabled={busy}
                      onClick={() =>
                        setRows((prev) =>
                          prev.filter((item) => item.id !== row.id),
                        )
                      }
                    >
                      ×
                    </IconButton>
                  </Row>
                ))}
              </List>
            )}

            {duplicateCount > 0 && (
              <Hint style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                이미 있는 이름 {duplicateCount}명은 그대로 추가됩니다. 필요하면
                삭제하세요.
              </Hint>
            )}

            <Footer>
              <Button
                type="button"
                $variant="ghost"
                disabled={busy}
                onClick={() => {
                  setError('');
                  if (sourceUrl) {
                    setStep('crop');
                    return;
                  }
                  setStep('upload');
                }}
              >
                {sourceUrl ? '다시 크롭' : '다시 입력'}
              </Button>
              <Button
                type="button"
                $variant="ghost"
                disabled={busy}
                onClick={onClose}
              >
                취소
              </Button>
              <Button
                type="button"
                disabled={busy || validNames.length === 0}
                onClick={handleConfirm}
              >
                {validNames.length}명 등록
              </Button>
            </Footer>
          </>
        )}

        {step === 'upload' && (
          <Footer>
            <Button type="button" $variant="ghost" onClick={onClose}>
              취소
            </Button>
          </Footer>
        )}
      </Modal>
    </Overlay>
  );
}
