export type EncodeFunc = (input: any) => Buffer;
export type DecodeFunc = (input: Buffer | Uint8Array | number[]) => Buffer;

export interface TypeCodec<T> {
  type?: number,
  clazz?: new(...args: any[]) => T,
  pack: (t: T, encode: EncodeFunc) => Buffer | Uint8Array,
  unpack: (data: Buffer | Uint8Array | string, decode: DecodeFunc) => T
}

export interface Framer {
  encode(input: any): Buffer;
  decode(input: Buffer | Uint8Array | number[]): any;
}
