export async function computeSHA256(input: File | Blob | ArrayBuffer | string): Promise<string> {
  let buffer: ArrayBuffer;

  if (typeof input === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(input).buffer;
  } else if (input instanceof ArrayBuffer) {
    buffer = input;
  } else {
    buffer = await input.arrayBuffer();
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatHashShort(hash: string, lead = 8, trail = 8): string {
  if (!hash || hash.length <= lead + trail) return hash;
  return `${hash.substring(0, lead)}...${hash.substring(hash.length - trail)}`;
}
