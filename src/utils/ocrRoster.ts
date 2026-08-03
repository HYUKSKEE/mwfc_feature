import { createWorker, PSM } from 'tesseract.js';
import { parseRosterText } from './parseRosterText';
import { preprocessImageForOcr } from './preprocessImage';

export type OcrProgress = {
  status: string;
  progress: number;
};

type RecognizeCandidate = {
  text: string;
  names: string[];
  confidence: number;
  mode: string;
};

const PAGE_MODES = [
  { mode: PSM.SINGLE_COLUMN, label: 'single_column' },
  { mode: PSM.SINGLE_BLOCK, label: 'single_block' },
  { mode: PSM.SPARSE_TEXT, label: 'sparse_text' },
] as const;

function scoreCandidate(candidate: RecognizeCandidate): number {
  // 이름 개수를 우선하고, 동점이면 confidence로 판단
  return candidate.names.length * 1000 + candidate.confidence;
}

export async function recognizeRosterNames(
  source: File | Blob | string,
  onProgress?: (progress: OcrProgress) => void,
): Promise<{ text: string; names: string[]; previewUrl: string }> {
  onProgress?.({ status: '이미지 전처리 중...', progress: 0.05 });
  const processed = await preprocessImageForOcr(source);

  onProgress?.({ status: '언어 데이터 준비 중...', progress: 0.15 });

  // 한글 명단 인식에 유리하도록 kor 우선
  const worker = await createWorker('kor', 1, {
    logger: (message) => {
      const base = 0.2;
      const span = 0.75;
      onProgress?.({
        status: message.status,
        progress: base + (typeof message.progress === 'number' ? message.progress : 0) * span,
      });
    },
  });

  try {
    let best: RecognizeCandidate | null = null;

    for (const [index, pageMode] of PAGE_MODES.entries()) {
      onProgress?.({
        status: `OCR 인식 중 (${index + 1}/${PAGE_MODES.length})...`,
        progress: 0.25 + (index / PAGE_MODES.length) * 0.6,
      });

      await worker.setParameters({
        tessedit_pageseg_mode: pageMode.mode,
        preserve_interword_spaces: '1',
        user_defined_dpi: '300',
      });

      const {
        data: { text, confidence },
      } = await worker.recognize(processed.canvas);

      const candidate: RecognizeCandidate = {
        text,
        names: parseRosterText(text),
        confidence: confidence ?? 0,
        mode: pageMode.label,
      };

      if (!best || scoreCandidate(candidate) > scoreCandidate(best)) {
        best = candidate;
      }

      // 충분히 많이 인식되면 조기 종료
      if (candidate.names.length >= 6 && candidate.confidence >= 60) {
        break;
      }
    }

    // kor만으로 거의 못 읽으면 eng 혼합으로 한 번 더
    if (!best || best.names.length < 2) {
      onProgress?.({ status: '보조 인식(kor+eng) 중...', progress: 0.9 });
      await worker.reinitialize('kor+eng');
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        preserve_interword_spaces: '1',
        user_defined_dpi: '300',
      });

      const {
        data: { text, confidence },
      } = await worker.recognize(processed.canvas);

      const fallback: RecognizeCandidate = {
        text,
        names: parseRosterText(text),
        confidence: confidence ?? 0,
        mode: 'kor_eng_sparse',
      };

      if (!best || scoreCandidate(fallback) > scoreCandidate(best)) {
        best = fallback;
      }
    }

    onProgress?.({ status: '완료', progress: 1 });

    return {
      text: best?.text ?? '',
      names: best?.names ?? [],
      previewUrl: processed.previewUrl,
    };
  } catch (error) {
    URL.revokeObjectURL(processed.previewUrl);
    throw error;
  } finally {
    await worker.terminate();
  }
}
