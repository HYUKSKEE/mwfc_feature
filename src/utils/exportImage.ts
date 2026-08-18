import { toPng } from 'html-to-image';

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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

/** 조별 이미지를 순서대로 바로 다운로드합니다. (공유 시트 없이 저장) */
export async function downloadNodesAsImages(
  items: Array<{ node: HTMLElement; filename: string }>,
): Promise<void> {
  for (let index = 0; index < items.length; index += 1) {
    const { node, filename } = items[index];
    const dataUrl = await captureNodeAsPng(node);
    downloadDataUrl(dataUrl, filename);

    // 브라우저가 연속 다운로드를 막지 않도록 짧게 대기
    if (index < items.length - 1) {
      await wait(250);
    }
  }
}

/** 단일 노드 이미지를 다운로드합니다. */
export async function downloadNodeAsImage(
  node: HTMLElement,
  filename: string,
): Promise<void> {
  await downloadNodesAsImages([{ node, filename }]);
}
