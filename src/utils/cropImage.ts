import type { Area } from 'react-easy-crop';

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('크롭용 이미지를 불러오지 못했습니다.'));
    image.src = url;
  });
}

/** react-easy-crop 영역으로 자른 Blob을 만듭니다. */
export async function cropImageToBlob(
  imageSrc: string,
  pixelCrop: Area,
  mimeType = 'image/png',
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = Math.max(1, Math.round(pixelCrop.width));
  const height = Math.max(1, Math.round(pixelCrop.height));

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('크롭 Canvas를 초기화하지 못했습니다.');
  }

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('크롭 이미지 생성에 실패했습니다.'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      1,
    );
  });
}
