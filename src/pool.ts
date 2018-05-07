import {EventEmitter} from "events";
import {Service} from "./service";
import * as os from "os";
import * as assert from "assert";
import {Framer} from "./framer";
import {MsgpackFramer} from "./framers";
import {Child, Provider} from "./index";

export interface FramerOptions {
  type?: string;

  [name: string]: any;
}

export interface PoolOptions {
  enabled?: boolean;
  size?: number;
  timeout?: number;
  file?: string;
  framer?: FramerOptions;
}

export class Pool extends EventEmitter {
  uid: number = 0;
  framer: Framer;
  children: Map<number, Service> = new Map();
  entry: any;
  provider: Provider;

  enabled: boolean = false;
  timeout: number = 120000;
  size: number;
  file: string;

  constructor(options?: PoolOptions);
  constructor(file: string, options?: PoolOptions);
  constructor(file?: string | PoolOptions, options?: PoolOptions) {
    super();
    if (typeof file === 'string') {
      options = options || {};
      options.file = file;
    } else {
      options = options || file || {};
    }

    this.file = process.env.ODYN_WORKER_FILE || '';
    this.size = cores();
    this.set(options);
  }

  protected set(options: PoolOptions) {
    if (!options) {
      return;
    }

    // not null and undefined
    if (options.enabled != null) {
      this.enabled = options.enabled;
    }

    if (options.size != null) {
      assert((options.size >>> 0) === options.size);
      assert(options.size > 0);
      this.size = options.size;
    }

    if (options.timeout != null) {
      assert(Number.isSafeInteger(options.timeout));
      assert(options.timeout >= -1);
      this.timeout = options.timeout;
    }

    if (options.file != null) {
      this.file = options.file;
    }

    assert(this.file);

    let entry: any = require(this.file);
    if (typeof entry === 'function') {
      entry = entry();
    }
    this.entry = entry;

    // builtin calling provider
    this.provider = new Provider();
    this.provider.methods(this.entry.methods || this.entry);

    const fo = options.framer || {};
    this.framer = new MsgpackFramer({preset: true});
    if (fo.codecs) {
      this.framer.register(fo.codecs);
    }
    if (entry.codecs) {
      this.framer.register(entry.codecs);
    }
  }

  close() {
    for (const child of this.children.values()) {
      child.close();
    }
  }

  spawn(id) {
    const {framer, children} = this;
    const pipe = new Child(this.file);
    const child = new Service({id, framer, pipe});

    child.on('error', err => {
      this.emit('error', err, child)
    });

    child.on('exit', code => {
      this.emit('exit', code, child);
      if (children.get(id) === child) {
        children.delete(id);
      }
    });

    child.on('signal', (items: Array<any>) => {
      const [event, ...args] = items;
      this.emit('signal', items, child);
      this.emit(event, ...args);
    });

    child.on('log', text => {
      this.emit('log', text, child);
    });

    this.emit('spawn', child);

    return child;
  }

  acquire(): Service {
    const {children} = this;
    const id = this.uid++ % this.size;

    if (!children.has(id)) {
      children.set(id, this.spawn(id));
    }

    return <Service>children.get(id);
  }

  signal(event, data) {
    for (const child of this.children.values()) {
      child.signal(event, data);
    }
  }

  execute(name: string, params?: any, timeout?: number): Promise<any> {
    if (!this.enabled || !Child.hasSupport()) {
      return new Promise<any>((resolve, reject) => setImmediate(() => {
        try {
          resolve(this.provider.call(name, params));
        } catch (e) {
          reject(e);
        }
      }));
    }

    if (timeout == null) {
      timeout = this.timeout;
    }

    return this.acquire().request(name, params, timeout);
  }

}

function cores(): number {
  return Math.max(2, os.cpus().length);
}
