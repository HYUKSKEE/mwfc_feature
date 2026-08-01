import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import styled from 'styled-components';
import { DEFAULT_SKILL, SKILL_OPTIONS } from '../constants/skill';
import type { SkillLevel } from '../types';
import { recognizeRosterNames } from '../utils/ocrRoster';

type DraftRow = {
  id: string;
  name: string;
};

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
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
`;

const HiddenInput = styled.input`
  display: none;
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
  max-height: 280px;
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

function createRow(name = ''): DraftRow {
  return {
    id: crypto.randomUUID(),
    name,
  };
}

export function BatchImportModal({
  open,
  existingNames,
  onClose,
  onConfirm,
}: Props) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [skill, setSkill] = useState<SkillLevel>(DEFAULT_SKILL);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    setDragging(false);
    setRows([]);
    setSkill(DEFAULT_SKILL);
    setBusy(false);
    setProgress(0);
    setStatus('');
    setError('');
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  const runOcr = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setError('');
    setBusy(true);
    setProgress(0);
    setStatus('이미지를 준비하는 중...');

    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return nextPreview;
    });

    try {
      const { names } = await recognizeRosterNames(file, (event) => {
        setStatus(event.status);
        setProgress(event.progress);
      });

      if (names.length === 0) {
        setRows([]);
        setError('이름을 찾지 못했습니다. 더 선명한 명단 이미지로 다시 시도해주세요.');
      } else {
        setRows(names.map((name) => createRow(name)));
      }
    } catch (ocrError) {
      console.error(ocrError);
      setError('OCR 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setRows([]);
    } finally {
      setBusy(false);
      setStatus('');
      setProgress(0);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void runOcr(file);
  };

  const validNames = rows
    .map((row) => row.name.trim())
    .filter(Boolean);

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
      <Modal role="dialog" aria-modal="true" aria-labelledby={inputId}>
        <Title id={inputId}>명단 일괄 등록</Title>
        <Hint>
          명단 이미지를 올리면 OCR로 이름을 읽습니다. 결과를 확인·수정한 뒤
          등록하세요. 첫 실행 시 언어 데이터를 받느라 조금 걸릴 수 있습니다.
        </Hint>

        <DropZone
          $dragging={dragging}
          $disabled={busy}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!busy) setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (busy) return;
            const file = event.dataTransfer.files?.[0];
            if (file) void runOcr(file);
          }}
        >
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={handleFileChange}
          />
          {previewUrl ? (
            <Preview src={previewUrl} alt="업로드한 명단 미리보기" />
          ) : (
            <>
              <strong style={{ color: '#f2f2f2' }}>이미지 선택 또는 드래그</strong>
              <span>PNG, JPG, WEBP 등</span>
            </>
          )}
          {!busy && previewUrl && <span>다른 이미지로 다시 인식하려면 클릭</span>}
        </DropZone>

        {busy && (
          <ProgressBox>
            <div>{status || '인식 중...'}</div>
            <ProgressTrack>
              <ProgressBar $value={progress} />
            </ProgressTrack>
          </ProgressBox>
        )}

        {error && <ErrorText>{error}</ErrorText>}

        <Toolbar>
          <Select
            value={skill}
            disabled={busy}
            onChange={(event) => setSkill(Number(event.target.value) as SkillLevel)}
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
                    setRows((prev) => prev.filter((item) => item.id !== row.id))
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
          <Button type="button" $variant="ghost" disabled={busy} onClick={onClose}>
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
      </Modal>
    </Overlay>
  );
}
