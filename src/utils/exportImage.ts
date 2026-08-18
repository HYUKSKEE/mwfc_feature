import { toPng } from 'html-to-image';

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/data:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function canShareFiles(files: File[]): boolean {
  return (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files })
  );
}

function prefersShareSheet(): boolean {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ 는 Mac처럼 보이지만 터치가 있음
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return true;
  }
  return window.matchMedia('(pointer: coarse)').matches;
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'NotAllowedError')
  );
}

/** Blob URL로 다운로드 (데스크톱·일부 브라우저). data: URL은 iOS에서 주소창만 바뀜. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

async function sharePngFile(file: File): Promise<'shared' | 'aborted' | 'unsupported'> {
  if (!canShareFiles([file])) return 'unsupported';

  try {
    await navigator.share({
      files: [file],
      title: file.name,
    });
    return 'shared';
  } catch (error) {
    if (isAbortError(error)) return 'aborted';
    throw error;
  }
}

/** 모바일(특히 iOS)은 공유 시트, 데스크톱은 Blob 다운로드 */
export async function savePngBlob(
  blob: Blob,
  filename: string,
): Promise<'shared' | 'downloaded' | 'aborted'> {
  const file = new File([blob], filename, { type: blob.type || 'image/png' });

  if (prefersShareSheet()) {
    const shareResult = await sharePngFile(file);
    if (shareResult === 'shared') return 'shared';
    if (shareResult === 'aborted') return 'aborted';
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}

export async function captureNodeAsPng(node: HTMLElement): Promise<string> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#0a0a0a',
    skipFonts: false,
  });
}

/** 조별 이미지를 순서대로 저장합니다. 가능하면 공유 시트, 아니면 Blob 다운로드. */
export async function downloadNodesAsImages(
  items: Array<{ node: HTMLElement; filename: string }>,
): Promise<void> {
  for (let index = 0; index < items.length; index += 1) {
    const { node, filename } = items[index];
    const dataUrl = await captureNodeAsPng(node);
    const blob = dataUrlToBlob(dataUrl);
    const result = await savePngBlob(blob, filename);

    // 사용자가 공유를 취소하면 나머지 조도 중단
    if (result === 'aborted') return;

    if (index < items.length - 1) {
      await wait(result === 'shared' ? 400 : 250);
    }
  }
}
