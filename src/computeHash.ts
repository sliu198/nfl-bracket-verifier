export default async function computeHash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new DataView(hashBuffer).getBigUint64(0).toString(36).toUpperCase();
}
