import {EventEmitter} from "events";
import {ChildProcess} from "child_process";
import * as cp from "child_process";
import * as path from "path";

const children = new Set<Child>();

let exitBound = false;

export class Child extends EventEmitter {
  protected child: ChildProcess;

  static hasSupport() {
    return true;
  }

  constructor(protected file: string) {
    super();
    bindExit();
    children.add(this);

    this.init();
  }

  protected init() {
    const bin = process.argv[0];
    const boot = path.resolve(__dirname, '..', 'boot');

    this.child = cp.spawn(bin, [boot, this.file], {
      stdio: "pipe",
      env: process.env
    });

    this.child.unref();

    this.child.on("error", err => {
      this.emit("error", err);
    });

    this.child.once("exit", (code, signal) => {
      children.delete(this);
      this.emit("exit", code == null ? -1 : code, signal);
    });

    // stdin
    this.child.stdin.on("error", err => {
      this.emit("error", err);
    });

    // stderr
    this.child.stderr.on("error", err => {
      this.emit("error", err);
    });

    this.child.stderr.on("data", data => {
      this.emit("error", new Error(data.toString()));
    });

    // stdout
    this.child.stdout.on("error", err => {
      this.emit("error", err);
    });

    this.child.stdout.on("data", data => {
      this.emit("data", data);
    });

  }

  write(data: any) {
    return this.child.stdin.write(data);
  }

  close() {
    this.child.kill('SIGTERM');
  }
}

/**
 * Cleanup all child processes.
 * @private
 */

function bindExit() {
  if (exitBound) return;

  exitBound = true;

  listenExit(() => {
    for (const child of children) child.close();
  });
}

/**
 * Listen for exit.
 * @param {Function} handler
 * @private
 */

function listenExit(handler) {
  const onSighup = () => {
    process.exit(1 | 0x80);
  };

  const onSigint = () => {
    process.exit(2 | 0x80);
  };

  const onSigterm = () => {
    process.exit(15 | 0x80);
  };

  const onError = err => {
    if (err && err.stack) console.error(String(err.stack));
    else console.error(String(err));

    process.exit(1);
  };

  process.once("exit", handler);

  if (process.listenerCount("SIGHUP") === 0) process.once("SIGHUP", onSighup);

  if (process.listenerCount("SIGINT") === 0) process.once("SIGINT", onSigint);

  if (process.listenerCount("SIGTERM") === 0)
    process.once("SIGTERM", onSigterm);

  if (process.listenerCount("uncaughtException") === 0)
    process.once("uncaughtException", onError);

  process.on("newListener", name => {
    switch (name) {
      case "SIGHUP":
        process.removeListener(name, onSighup);
        break;
      case "SIGINT":
        process.removeListener(name, onSigint);
        break;
      case "SIGTERM":
        process.removeListener(name, onSigterm);
        break;
      case "uncaughtException":
        process.removeListener(name, onError);
        break;
    }
  });
}
