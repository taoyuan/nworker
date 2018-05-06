export const errors = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603
};

export const errmsgs = {
  [errors.PARSE_ERROR]: 'Parse Error',
  [errors.INVALID_REQUEST]: 'Invalid request',
  [errors.METHOD_NOT_FOUND]: 'Method not found',
  [errors.INVALID_PARAMS]: 'Invalid method parameter(s)',
  [errors.INTERNAL_ERROR]: 'Internal error',
};

// export class Parsation extends EventEmitter {
//   constructor() {
//     super();
//   }
// }

// export function parse(stream: Stream, options: { [name: string]: any }) {
//   const p = new Parsation();
//   const onError = (err: any) => p.emit('error', err);
//   const onData = (data: any) => p.emit('data', data);
//
//   const result = msgpack.createDecodeStream(options);
//   result.on('data', onData);
//   result.on('error', onError);
//
//   stream.on('error', onError);
//   stream.pipe(result);
//
//   return p;
//
// }

// export function encode(value: any, options: { [name: string]: any }): Promise<Buffer> {
//   return Promise.resolve(msgpack.encode(value, options));
// }
//
// export function response(error: any, result: any, id?: any) {
//   return {
//     type: error ? MessageType.reject : MessageType.resolve,
//     payload: error ? error : result,
//     id,
//   }
// }

// export function signal(name: string, payload: any) {
//   return {
//     type: MessageType.signal,
//     name,
//     payload
//   }
// }
//
// export function error(code: number, message?: string | null, data?: any): { code: number, message?: string | null, data?: any } {
//   if (typeof(message) !== 'string') {
//     message = this.errorMessages[code] || '';
//   }
//
//   const error: any = {code: code, message: message};
//   if (typeof(data) !== 'undefined') {
//     error.data = data;
//   }
//   return error;
// }
