import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import {assert} from "chai";
import * as path from "path";
import {Pool} from "../src";
import {Person} from "./fixtures/services/types";

chai.use(chaiAsPromised);

describe('workerpool', () => {

  let pool: Pool;

  before(() => {
    pool = new Pool({
      enabled: true,
      file: path.resolve(__dirname, './fixtures/services/entry')
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
    const result = await pool.execute("greet", new Person('Tom'));
    assert.equal(result, 'Hello Tom');
  });

  it('should return a custom object with codec', async () => {
    const result = await pool.execute("person", 'Tom');
    assert.instanceOf(result, Person);
  });

  it("should throw error for incorrect method", async () => {
    await assert.isRejected(pool.execute("invalid", [1, 2, 3]), 'invalid method');
  });
});
