import crypto from 'crypto';

export default function buildRandomSeed(videoUUID: string, instanceID: string): string {
  const combinedString = videoUUID + instanceID;
    
  // Convert the combined string to a buffer, use buffer to get a hash string
  const buffer: Buffer = Buffer.from(combinedString, 'utf-8');
  const hash: string = crypto.createHash('sha256').update(buffer).digest('hex');
    
  // Return a substring of the hash to use as the seed
  const seed = hash.substring(0, 30);
  
  return seed;
}

  