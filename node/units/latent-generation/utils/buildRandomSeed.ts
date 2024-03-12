export default function buildRandomSeed(videoUUID: string, instanceID: string): string {
  const combinedString = videoUUID + instanceID;

  // Initialize hash value
  let hash = 0;

  // Polynomial coefficients (prime numbers recommended)
  const prime = 31;
  const prime2 = 37;

  // Calculate hash using polynomial hash function
  for (let i = 0; i < combinedString.length; i++) {
    hash += combinedString.charCodeAt(i) * Math.pow(prime, i);
    hash %= prime2; // Take modulo to avoid integer overflow
  }

  // Convert hash to hexadecimal string
  const hashString = hash.toString(16);

  return hashString;
}
