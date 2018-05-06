const {Pool} = require('../..');

const pool = new Pool(require.resolve('./entry'), {
  enabled: true
});

(async () => {
  const person = await pool.execute('createPerson', 'Tom');
  console.log(person.greet()); // => Hello Tom
  await pool.close();
})();
