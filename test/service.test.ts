import {assert} from "chai";
import {MsgpackFramer, Service} from '../src';
import {Pipe} from "./fixtures/pipe";
import {throwError} from "./support";
import {Person} from "./fixtures/services/types";

describe('service', () => {
  let ss, cs: Service;

  before(() => {
    const entry = require('./fixtures/services/entry');
    const framer = new MsgpackFramer(entry);

    const sp = new Pipe();
    const cp = new Pipe();
    sp.pipe(cp).pipe(sp);

    ss = new Service({framer, pipe: sp});
    cs = new Service({framer, pipe: cp});
    ss.on('error', throwError);
    cs.on('error', throwError);

    ss.methods(entry.methods);
  });

  after(async () => {
    await ss.close();
    await cs.close();
  });

  it('should rpc simple method', async () => {
    const result = await cs.request("sum", [1, 2, 3]);
    assert.equal(result, 6);
  });

  it('should rpc method with custom object codec', async () => {
    const result = await cs.request("greet", new Person('Tom'));
    assert.equal(result, 'Hello Tom');
  });

  it('should return a custom object', async () => {
    const result = await cs.request("person", 'Tom');
    assert.instanceOf(result, Person);
  });
});