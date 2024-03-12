import { createCanvas } from 'canvas';

export default function generateRandomImage(seed: string): Buffer {

  // Create a canvas with a width and height of 128 pixels
  const canvas = createCanvas(128, 128);
  const ctx = canvas.getContext('2d');

  // Generate random pixel values based on the seed
  const imageData = ctx.createImageData(128, 128);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Generate random grayscale value
    const gray = Math.floor(Math.random() * 256);

    // Set pixel color to grayscale
    data[i] = gray;    // Red channel
    data[i + 1] = gray;  // Green channel
    data[i + 2] = gray;  // Blue channel
    data[i + 3] = 255;  // Alpha channel (fully opaque)
}

  // Put the generated pixel data onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert the canvas to a buffer (PNG format)
  const buffer: Buffer = canvas.toBuffer('image/png');

  return buffer;
}
