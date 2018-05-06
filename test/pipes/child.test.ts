import * as path from "path";
import {assert} from "chai";
import {MsgpackFramer, Service, Child} from "../../src/index";
import {throwError} from "../support";
import {Person} from "../fixtures/services/types";

describe('pipes/child', () => {

  let client: Service;

  before(() => {
    const entry = require('../fixtures/services/entry');
    const framer = new MsgpackFramer(entry);
    const pipe = new Child(path.resolve(__dirname, '../fixtures/services/entry'));
    pipe.on('error', throwError);

    client = new Service({framer, pipe});
    client.on('error', throwError);
  });

  after(async () => {
    await client.close();
  });

  it('should rpc simple method', async () => {
    const result = await client.request("sum", [1, 2, 3]);
    assert.equal(result, 6);
  });

  it('should rpc method with custom object codec', async () => {
    const result = await client.request("greet", new Person('Tom'));
    assert.equal(result, 'Hello Tom');
  });

  it('should return a custom object with codec', async () => {
    const result = await client.request("person",'Tom');
    assert.instanceOf(result, Person);
  });

});
