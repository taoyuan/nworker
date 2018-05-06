export interface Handler {
  (payload?: any): Promise<any>;
}

export class Method {
  constructor(
    public handler: Handler,
    public options: any = {}
  ) {
  }

  execute(service: any, params: any): Promise<any> {
    if (params == null) {
      params = [];
    } else if (!Array.isArray(params)) {
      params = [params];
    }
    return Promise.resolve(this.handler.call(service, ...params));
  }
}
