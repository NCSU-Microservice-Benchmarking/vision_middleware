import { createCanvas } from 'canvas';

export default function generateRandomImage(seed: string): Buffer {

  // Create a canvas with a width and height of 128 pixels
  const canvas = createCanvas(128, 128);
  const ctx = canvas.getContext('2d');

  // Generate random pixel values based on the seed
  const imageData = ctx.createImageData(128, 128);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Generate random RGB values based on the seed
    const r = seed.charCodeAt(i) % 256;
    const g = seed.charCodeAt(i + 1) % 256;
    const b = seed.charCodeAt(i + 2) % 256;

    // Set pixel color
    data[i] = r;    // Red channel
    data[i + 1] = g;  // Green channel
    data[i + 2] = b;  // Blue channel
    data[i + 3] = 255;  // Alpha channel (fully opaque)
  }

  // Put the generated pixel data onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert the canvas to a buffer (PNG format)
  const buffer: Buffer = canvas.toBuffer('image/png');

  return buffer;
}
