import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

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

/** 단일 노드 이미지를 다운로드합니다. */
export async function downloadNodeAsImage(
  node: HTMLElement,
  filename: string,
): Promise<void> {
  const dataUrl = await captureNodeAsPng(node);
  saveAs(dataUrlToBlob(dataUrl), filename);
}
