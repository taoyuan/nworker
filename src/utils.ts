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
