export default function buildRandomSeed(video_uuid: string, instance_id: string): string {
  const combinedString = video_uuid + instance_id;

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
