import { createWorker } from 'tesseract.js';
import { parseRosterText } from './parseRosterText';

export type OcrProgress = {
  status: string;
  progress: number;
};

export async function recognizeRosterNames(
  source: File | Blob | string,
  onProgress?: (progress: OcrProgress) => void,
): Promise<{ text: string; names: string[] }> {
  onProgress?.({ status: 'loading language data', progress: 0 });

  const worker = await createWorker('kor+eng', 1, {
    logger: (message) => {
      onProgress?.({
        status: message.status,
        progress: typeof message.progress === 'number' ? message.progress : 0,
      });
    },
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(source);

    return {
      text,
      names: parseRosterText(text),
    };
  } finally {
    await worker.terminate();
  }
}
