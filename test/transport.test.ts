import {assert} from "chai";
import {Transport} from "../src/transport";
import {Pipe} from "./fixtures/pipe";

describe('transport', () => {
  it('should work', (done) => {
    const expected = Buffer.from("hello world");

    const sp = new Pipe();
    const cp = new Pipe();
    sp.pipe(cp).pipe(sp);

    const st = new Transport(sp);
    const ct = new Transport(cp);

    st.on('data', data => {
      assert.deepEqual(data, expected);
      done();
    });

    ct.send(expected);

  });
});
