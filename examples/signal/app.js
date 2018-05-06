const {Pool} = require('../..');

const pool = new Pool(require.resolve('./entry'), {
  enabled: true
});

(async () => {
  pool.on('person', person => {
    console.log(person);
    // =>
    // Person { name: 0 }
    // Person { name: 1 }
  });

  await pool.execute('start');
  setTimeout(async () => {
    await pool.execute('stop');
    await pool.close();
  }, 1000);
})();
