import {Framer} from "../framer";
import {Codec, CodecOptions, DecoderOptions, EncoderOptions} from "msgpack-lite";
import * as msgpack from "msgpack-lite";

export interface MsgpackFramerOptions {
  codec?: CodecOptions
  types?: Array<any>
}

export class MsgpackFramer implements Framer {

  codec: Codec;

  get encoderOptions(): EncoderOptions {
    return {codec: this.codec};
  }

  get decoderOptions(): DecoderOptions {
    return {codec: this.codec};
  }

  constructor(protected options: MsgpackFramerOptions = {}) {
    this.codec = msgpack.createCodec(options.codec);
    if (options) {
      this.init();
    }
  }

  protected init() {
    const {codec, options} = this;
    let {types} = options;
    if (types && !Array.isArray(types)) {
      types = Object.values(types);
    }

    if (types && types.length) {
      types.forEach((item, index) => {
        const etype = 0x30 + (item.type || item.etype || index);
        const clazz = typeof item === 'function' ? item : item.clazz;
        if (item.pack) {
          codec.addExtPacker(etype, clazz, (input) => item.pack(input, (input) => msgpack.encode(input, this.encoderOptions)));
        }
        if (item.unpack) {
          codec.addExtUnpacker(etype, (input) => item.unpack(input, (input) => msgpack.decode(input, this.decoderOptions)));
        }
      });
    }
  }

  encode(input: any): Buffer {
    return msgpack.encode(input, this.encoderOptions);
  }

  decode(input: Buffer | Uint8Array | number[]): any {
    return msgpack.decode(input, this.decoderOptions);
  }
}
