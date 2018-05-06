import * as assert from "assert";
import {Message, Provider} from "./provider";
import {Framer} from "./framer";
import {Transport} from "./transport";

export interface ServiceOptions {
  id?: any;
  framer: Framer,
  transport?: Transport,
  pipe?: any,
  timeout?: number
}

export class Service extends Provider {
  id: any;
  framer: Framer;
  transport: Transport;

  constructor(options: ServiceOptions) {
    super({timeout: options.timeout});

    assert(options.framer, 'option framer is required');
    assert(options.transport || options.pipe, 'option framer or pipe is required');

    this.id = options.id;
    this.framer = options.framer;
    if (options.transport) {
      this.transport = options.transport;
    } else {
      this.transport = new Transport(options.pipe);
    }

    this.init();
  }

  protected init() {
    // handle incoming message
    this.transport.on('data', data => {
      const message = this.framer.decode(data);
      this.handle(message);
    });

    this.transport.on('error', error => {
      this.emit('error', error);
    });

    this.transport.on('exit', (code, signal) => {
      this.emit('exit', code, signal);
    });
  }

  protected dispatch(message: Message): boolean {
    // handle outgoing message
    return this.transport.send(this.framer.encode(message));
  }

  async close() {
    await this.transport.close();
  }
}
