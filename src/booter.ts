import * as path from "path";
import {EventEmitter} from "events";
import {Transport} from "./transport";
import {Parent} from "./pipes";
import {Service} from "./service";
import {MsgpackFramer} from "./framers";

export class Booter extends EventEmitter {
  protected parent: Parent;
  protected service: Service;

  constructor(protected entryfile: string) {
    super();
    this.entryfile = path.resolve(process.cwd(), entryfile);
    this.parent = new Parent();
    this.init();
  }

  init() {
    this.parent.on('error', (err) => {
      this.emit('error', err);
    });

    this.parent.on('exception', (err) => {
      this.service.signal('error', err);
      setTimeout(() => this.destroy(), 1000);
    });
  }

  boot() {
    const framer = new MsgpackFramer({preset: true});
    const transport = new Transport(this.parent);
    this.service = new Service({framer, transport});

    let entry: any = require(this.entryfile);
    if (typeof entry === 'function') {
      entry = entry();
    }

    // register customized codecs
    framer.register(entry.codecs);
    this.service.methods(entry.methods || entry);

    this.on('error', (err) => {
      this.service.signal('error', err);
    });
  }

  destroy() {
    process.exit(0);
  }

}

