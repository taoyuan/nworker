import {EventEmitter} from 'events';

/**
 * Parent
 * Represents the parent process.
 */
export class Parent extends EventEmitter {

  /**
   * Create the parent process.
   * @constructor
   */
  constructor() {
    super();

    this.init();
  }

  init() {
    process.stdin.on('data', (data) => {
      this.emit('data', data);
    });

    // Nowhere to send these errors:
    process.stdin.on('error', () => {});
    process.stdout.on('error', () => {});
    process.stderr.on('error', () => {});

    process.on('uncaughtException', (err) => {
      this.emit('exception', err);
    });
  }

  write(data) {
    return process.stdout.write(data);
  }

  /**
   * Destroy the parent process.
   */

  close() {
    process.exit(0);
  }
}
