const {Pool} = require('../../..');

const pool = new Pool(require.resolve('./worker'), {
  enabled: true
});

module.exports = {
  test(pageDescription) {
    return pool.execute('renderHTML', [{data: pageDescription}]);
  },

  version: () => require('../../../package').version
};
