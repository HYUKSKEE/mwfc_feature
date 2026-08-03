const MIN_SHORT_SIDE = 1400;
const MAX_LONG_SIDE = 2800;

export type PreprocessResult = {
  canvas: HTMLCanvasElement;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
};

function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl =
      typeof source === 'string' ? null : URL.createObjectURL(source);

    image.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 불러오지 못했습니다.'));
    };

    image.src = objectUrl ?? (source as string);
  });
}

function getScale(width: number, height: number): number {
  const shortSide = Math.min(width, height);
  const longSide = Math.max(width, height);

  let scale = 1;
  if (shortSide < MIN_SHORT_SIDE) {
    scale = MIN_SHORT_SIDE / shortSide;
  }

  if (longSide * scale > MAX_LONG_SIDE) {
    scale = MAX_LONG_SIDE / longSide;
  }

  return scale;
}

function toGrayscale(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

function stretchContrast(data: Uint8ClampedArray) {
  let min = 255;
  let max = 0;

  for (let i = 0; i < data.length; i += 4) {
    const value = data[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const range = Math.max(max - min, 1);
  for (let i = 0; i < data.length; i += 4) {
    const stretched = ((data[i] - min) / range) * 255;
    const value = Math.max(0, Math.min(255, stretched));
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}

/** Otsu 이진화로 글자/배경을 분리합니다. */
function applyOtsuThreshold(data: Uint8ClampedArray) {
  const histogram = new Array<number>(256).fill(0);
  const total = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    histogram[Math.round(data[i])] += 1;
  }

  let sum = 0;
  for (let i = 0; i < 256; i += 1) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let maxVariance = 0;
  let threshold = 127;

  for (let t = 0; t < 256; t += 1) {
    wB += histogram[t];
    if (wB === 0) continue;

    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] > threshold ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
}

/**
 * OCR 인식률을 위해 확대 → 그레이스케일 → 대비 보정 → 이진화 처리합니다.
 */
export async function preprocessImageForOcr(
  source: File | Blob | string,
): Promise<PreprocessResult> {
  const image = await loadImage(source);
  const scale = getScale(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Canvas를 초기화하지 못했습니다.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  toGrayscale(imageData.data);
  stretchContrast(imageData.data);
  applyOtsuThreshold(imageData.data);
  context.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (!value) {
          reject(new Error('전처리 이미지 생성에 실패했습니다.'));
          return;
        }
        resolve(value);
      },
      'image/png',
      1,
    );
  });

  return {
    canvas,
    blob,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
  };
}
