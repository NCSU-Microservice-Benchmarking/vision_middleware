import seedrandom from 'seedrandom';
import { createCanvas } from 'canvas';

export default function generateRandomImage(seed: string): Buffer {
  // Create a canvas with a width and height of 128 pixels
  const canvas = createCanvas(128, 128);
  const ctx = canvas.getContext('2d');

  // Seed the random number generator with the seed string
  const rng = seedrandom(seed);

  // Generate pixel values based on the seed
  const imageData = ctx.createImageData(128, 128);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Generate a random greyscale value between 0 and 255
    const greyscaleValue = Math.floor(rng() * 256);

    // Set pixel color (R, G, and B channels) to the generated greyscale value
    data[i] = greyscaleValue;    // Red channel
    data[i + 1] = greyscaleValue;  // Green channel
    data[i + 2] = greyscaleValue;  // Blue channel

    // Set alpha channel (fully opaque)
    data[i + 3] = 255;
  }

  // Put the generated pixel data onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert the canvas to a buffer (PNG format)
  const buffer: Buffer = canvas.toBuffer('image/png');

  return buffer;
}
