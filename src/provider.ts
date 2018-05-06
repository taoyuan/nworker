import {Method} from "./method";
import {EventEmitter} from "events";

export const MSG_RESOLVE = "resolve";
export const MSG_REJECT = "reject";
export const MSG_ERROR = "error";

export interface Listener<T> {
  (event: T): any;
}

export interface Disposable {
  dispose(): void;
}

export interface Transaction {
  id: number;
  htimeout?: any;

  resolve(result: any): void;

  reject(error: string): void;
}

export enum MessageType {
  signal,
  rpc,
  internal
}

export interface Dispatcher {
  (message: Message, transfer?: Array<any>): boolean;
}

export interface Message {
  type: MessageType;
  name: string;
  id?: number;
  payload?: any;
}

export interface ProviderOptions {
  dispatch?: Dispatcher,
  timeout?: number
}

export class Provider extends EventEmitter {
  private _nextId = 0;
  private _methods: { [id: string]: Method } = {};
  private _pendings: { [id: number]: Transaction } = {};

  protected _dispatch?: Dispatcher;
  protected _timeout: number = 0;

  constructor(dispatch?: Dispatcher);
  constructor(options?: ProviderOptions);
  constructor(options?: ProviderOptions | Dispatcher) {
    super();
    if (typeof options === 'function') {
      options = {dispatch: options};
    }
    options = options || {};
    this._dispatch = options.dispatch;
    this._timeout = options.timeout || 0;
  }

  protected dispatch(message: Message): boolean {
    if (!this._dispatch) {
      throw new Error('Not implemented');
    }
    return this._dispatch(message);
  }

  method(name: string, definition: any): void {
    const isMethod = definition instanceof Method;
    const isFunction = typeof definition === 'function';

    // a valid method is either a function or a client (relayed method)
    if (!isMethod && !isFunction) {
      return;
      // throw new TypeError('method definition must be either a function or an instance of Method');
    }

    if (/^rpc\./.test(name)) {
      throw new TypeError('"' + name + '" is a reserved method name');
    }

    // make instance of jayson.Method
    if (!isMethod) {
      definition = new Method(definition, {});
    }

    this._methods[name] = definition;
  }

  methods(methods: { [name: string]: any }): this {
    methods = methods || {};

    for (let name in methods) {
      this.method(name, methods[name]);
    }

    return this;
  }

  hasMethod(name: string): boolean {
    return name in this._methods;
  }

  removeMethod(name: string): void {
    if (this.hasMethod(name)) {
      delete this._methods[name];
    }
  }

  listen(event: string, listener: Listener<any>): Disposable {
    this.on(event, listener);
    return {
      dispose: () => this.off(event, listener)
    };
  }

  off(event: string, listener: Listener<any>): void {
    this.removeListener(event, listener);
  }

  call(name: string, params: any): Promise<any> {
    if (!this._methods[name]) {
      throw new Error(`invalid method ${name}`);
    }

    return Promise.resolve(this._methods[name].execute(this, params));
  }

  handle(message: Message): boolean {
    switch (message.type) {
      case MessageType.signal:
        return this._handleSignal(message);

      case MessageType.rpc:
        return this._handelRequest(message);

      case MessageType.internal:
        return this._handleInternal(message);

      default:
        return this._raiseError(`invalid message type ${message.type}`);
    }
  }

  request<T, U>(method: string, params?: T, options?: any | number): Promise<U> {
    return new Promise((resolve, reject) => {
      if (typeof options === 'number') {
        options = {timeout: options}
      }
      options = options || {};
      const timeout = options.timeout != null ? options.timeout : this._timeout;

      const id = this._nextId++;

      const transaction = this._pendings[id] = {
        id,
        resolve,
        reject
      };

      if (timeout > 0) {
        this._pendings[id].htimeout = setTimeout(() => this._handleTimeout(transaction), timeout);
      }

      this.dispatch({
        type: MessageType.rpc,
        id: id,
        name: method,
        payload: params
      });
    });
  }

  signal(name: string, payload?: any): boolean {
    return this.dispatch({
      type: MessageType.signal,
      name,
      payload,
    });
  }

  private _raiseError(error: string): boolean {
    // this.emit('error', new Error(error));

    return this.dispatch({
      type: MessageType.internal,
      name: MSG_ERROR,
      payload: error
    });
  }

  private _handleSignal(message: Message): boolean {
    this.emit('signal', [message.name, message.payload]);
    this.emit(message.name, message.payload);
    return true;
  }

  private _handelRequest(message: Message): any {
    if (!this._methods[message.name]) {
      // return this._raiseError(`invalid method "${message.name}"`);
      return this.dispatch({
        type: MessageType.internal,
        name: MSG_REJECT,
        id: message.id,
        payload: `invalid method "${message.name}"`
      });
    }

    return this.call(message.name, message.payload).then(
      (result: any) => this.dispatch({
        type: MessageType.internal,
        name: MSG_RESOLVE,
        id: message.id,
        payload: result
      }),
      (reason: string) => this.dispatch({
        type: MessageType.internal,
        name: MSG_REJECT,
        id: message.id,
        payload: reason
      })
    );
  }

  private _handleInternal(message: Message): any {
    switch (message.name) {
      case MSG_RESOLVE:
        if (!message.id && message.id != 0) {
          return this._raiseError(`invalid internal message. message "id" is required`);
        }
        if (!this._pendings[message.id]) {
          return this._raiseError(`no pending transaction with id ${message.id}`);
        }

        this._pendings[message.id].resolve(message.payload);
        this._clearTransaction(this._pendings[message.id]);

        break;

      case MSG_REJECT:
        if (!message.id && message.id != 0) {
          return this._raiseError(`invalid internal message. message "id" is required`);
        }
        if (!this._pendings[message.id]) {
          return this._raiseError(`no pending transaction with id ${message.id}`);
        }

        this._pendings[message.id].reject(message.payload);
        this._clearTransaction(this._pendings[message.id]);

        break;

      case MSG_ERROR:
        this.emit('error', new Error(`remote error: ${message.payload}`));
        break;

      default:
        this._raiseError(`unhandled internal message ${message.name}`);
        break;
    }
  }

  private _handleTimeout(transaction: Transaction): void {
    transaction.reject('transaction timed out');
    this._raiseError(`transaction ${transaction.id} timed out`);
    delete this._pendings[transaction.id];
  }

  private _clearTransaction(transaction: Transaction): void {
    if (typeof(transaction.htimeout) !== 'undefined') {
      clearTimeout(transaction.htimeout);
    }

    delete this._pendings[transaction.id];
  }

}
