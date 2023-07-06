declare module 'proquint-' {
  export function encode(buffer: Buffer): string;
  export function decode(proquint: string): Buffer;
}
