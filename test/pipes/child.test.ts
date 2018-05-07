import {assert} from "chai";
import {MsgpackFramer, Service, Child} from "../../src/index";
import * as s from "../support";

const entry = require(s.fixture('simple'));

describe('pipes/child', () => {

  let client: Service;

  before(() => {
    const framer = new MsgpackFramer();
    framer.register(entry.codecs);
    const pipe = new Child(s.fixture('simple'));
    pipe.on('error', s.throwError);

    client = new Service({framer, pipe});
    client.on('error', s.throwError);
  });

  after(async () => {
    await client.close();
  });

  it('should rpc simple method', async () => {
    const result = await client.request("sum", [1, 2, 3]);
    assert.equal(result, 6);
  });

  it('should rpc method with custom object codec', async () => {
    const result = await client.request("greet", new entry.Person('Tom'));
    assert.equal(result, 'Hello Tom');
  });

  it('should return a custom object with codec', async () => {
    const result = await client.request("person",'Tom');
    assert.instanceOf(result, entry.Person);
  });

});
