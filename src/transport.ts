import {EventEmitter} from "events";

const BUFFER_INITIAL_SIZE = 1024 * 1024; // 1MB
const BUFFER_GROW_RATIO = 1.5;

export class LengthPrefixParser extends EventEmitter {
  buffer: Buffer;
  pos: number;

  constructor(
    protected initialSize: number = BUFFER_INITIAL_SIZE,
    protected ratio: number = BUFFER_GROW_RATIO) {
    super();
    this.reset(initialSize);
  }

  reset(size?: number) {
    if (size === undefined) {
      size = this.initialSize;
    }
    size = size || 0;
    this.buffer = Buffer.alloc(size);
    this.pos = 0;
  }

  protected check() {
    const headerLength = Uint32Array.BYTES_PER_ELEMENT;
    const bodyLength = new Uint32Array(this.buffer.buffer, 0, 1)[0];
    const totalMsgLength = headerLength + bodyLength;

    if (this.pos > headerLength && this.pos >= totalMsgLength) {
      const data = this.buffer.slice(headerLength, headerLength + bodyLength);

      this.emit('data', data);

      // copy remaining chunk to the start of the buffer and reset pointers
      this.buffer.copy(this.buffer, 0, totalMsgLength, this.pos);
      this.pos = this.pos - totalMsgLength;

      if (this.pos >= headerLength) {
        this.check();
      }
    }
  }

  parse(chunk) {
    // extend the buffer to ensure that it is
    // large enough to store the incoming chunk
    while (this.pos + chunk.byteLength > this.buffer.byteLength) {
      const newBuffer = Buffer.alloc(this.buffer.byteLength * this.ratio);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }

    this.pos += chunk.copy(this.buffer, this.pos);
    this.check();
  }
}

export class Transport extends EventEmitter {
  protected pipe: any;
  protected parser: LengthPrefixParser;

  protected onError: Function;
  protected onExit: Function;
  protected onData: Function;

  constructor(pipe: any) {
    super();
    this.parser = new LengthPrefixParser();
    this.parser.on('data', data => this.emit('data', data));

    this.onError = (error) => this.emit('error', error);
    this.onExit = (code, signal) => this.emit('exit', code, signal);
    this.onData = data => this.parser.parse(data);

    this.bind(pipe);
  }

  protected bind(pipe) {
    // ignore same pipe
    if (this.pipe === pipe) {
      return;
    }

    if (this.pipe) {
      this.pipe.removeListener('error', this.onError);
      this.pipe.removeListener('data', this.onData);
      this.pipe.removeListener('exit', this.onExit);
    }
    this.pipe = pipe;
    if (pipe) {
      pipe.on('error', this.onError);
      pipe.on('data', this.onData);
      pipe.on('exit', this.onExit);
    }
    this.parser.reset(pipe ? undefined : 0);
  }

  send(data: Buffer): boolean {
    const len = new Uint32Array([data.byteLength]);
    this.pipe.write(Buffer.from(<ArrayBuffer>len.buffer));
    return this.pipe.write(data);
  }

  async close() {
    if (this.pipe && this.pipe.close) {
      await this.pipe.close();
    }
    this.bind(null);
  }
}
