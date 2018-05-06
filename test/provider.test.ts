import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { assert } from "chai";
import { Provider } from "../src";
import * as s from './support';

chai.use(chaiAsPromised);

describe("provider", () => {
  let server, client: Provider;

  before(() => {
    server = new Provider({dispatch: message => client.handle(message)});
    client = new Provider(message => server.handle(message));
    // server.on('error', throwError);
    // client.on('error', throwError);
    server.methods(require(s.fixture('simple')));
  });

  it("should work", async () => {
    const result = await client.request("sum", [1, 2, 3]);
    assert.equal(result, 6);
  });

  it("should throw error for incorrect method", async () => {
    await assert.isRejected(client.request("invalid", [1, 2, 3]), 'invalid method');
  });
});
