import {assert} from 'chai';
import * as s from './support';

describe('integration', function () {
  this.timeout(5000);

  after(async () => s.close());

  it('should allow limit the number of workers active in a given time', async () => {
    const pool = s.givenWorkerPoolWith('process-info', {
      enabled: true,
      size: 1
    });

    const results = await s.repeat(10, () => pool.execute('getPid'));

    assert.lengthOf(s.unique(results), 1);
  });
});
