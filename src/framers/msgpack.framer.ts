import {Codec, Framer} from "../framer";
import * as msgpack from "msgpack-lite";
import {CodecOptions, DecoderOptions, EncoderOptions} from "msgpack-lite";

export class MsgpackFramer implements Framer {

  protected registry: msgpack.Codec;

  get encoderOptions(): EncoderOptions {
    return {codec: this.registry};
  }

  get decoderOptions(): DecoderOptions {
    return {codec: this.registry};
  }

  constructor(protected options: CodecOptions = {}) {
    options = Object.assign({preset: true}, options);
    this.registry = msgpack.createCodec(options);
  }

  register(codecs: Array<Codec<any>>) {
    if (codecs && !Array.isArray(codecs)) {
      codecs = Object.values(codecs);
    }
    if (!codecs || !codecs.length) {
      return;
    }
    for (let i = 0; i < codecs.length; i++) {
      const c = codecs[i];
      if (!c) continue;

      const etype = 0x30 + (c.etype || i);
      let clazz;
      if (c.clazz && isConstructor(c.clazz)) {
        clazz = c.clazz;
      } else if (isConstructor(c)) {
        clazz = c;
      } else {
        throw new Error('invalid codec');
      }

      if (c.pack) {
        this.registry.addExtPacker(etype, clazz, (input) => c.pack(input, (input) => msgpack.encode(input, this.encoderOptions)));
      }
      if (c.unpack) {
        this.registry.addExtUnpacker(etype, (input) => c.unpack(input, (input) => msgpack.decode(input, this.decoderOptions)));
      }
    }
  }

  encode(input: any): Buffer {
    return msgpack.encode(input, this.encoderOptions);
  }

  decode(input: Buffer | Uint8Array | number[]): any {
    return msgpack.decode(input, this.decoderOptions);
  }
}

function isConstructor(f) {
  try {
    new f();
  } catch (err) {
    if (err.message.indexOf('is not a constructor') >= 0) {
      return false;
    }
  }
  return true;
}
