import {EventEmitter} from "events";

export class Pipe extends EventEmitter {
  dest: Pipe;

  pipe(dest: Pipe): Pipe {
    this.dest = dest;
    return dest;
  }

  write(data: Buffer) {
    if (!this.dest) throw new Error('dest pipe is not assigned');
    this.dest.emit('data', data);
  }
}
