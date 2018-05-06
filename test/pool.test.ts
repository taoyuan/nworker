import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import {assert} from "chai";
import * as path from "path";
import {Pool} from "../src";
import * as s from "./support";

chai.use(chaiAsPromised);

const entry = require(s.fixture('simple'));

describe('workerpool', () => {

  let pool: Pool;

  before(() => {
    pool = new Pool(s.fixture('simple'), {
      enabled: true,
    });
  });

  after(async () => {
    await pool.close();
  });

  it('should rpc simple method', async () => {
    const result = await pool.execute("sum", [1, 2, 3]);
    assert.equal(result, 6);
  });

  it('should rpc method with custom object codec', async () => {
    const result = await pool.execute("greet", new entry.Person('Tom'));
    assert.equal(result, 'Hello Tom');
  });

  it('should return a custom object with codec', async () => {
    const result = await pool.execute("person", 'Tom');
    assert.instanceOf(result, entry.Person);
  });

  it("should throw error for incorrect method", async () => {
    await assert.isRejected(pool.execute("invalid", [1, 2, 3]), 'invalid method');
  });
});
