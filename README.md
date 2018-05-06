# nworker

> A node.js library to run cpu-intensive tasks in a separate processes and not block the event loop.

## Install

Install via npm:

```bash
$ npm i nworker
```

Node.js greater than 6.6.0 highly recommended.

## Examples

### Simple

`entry.js`

```js

function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 2) + fibonacci(n - 1);
}

exports.methods = {fibonacci};
```

`app.js`
```js
const {Pool} = require('nworker');

const pool = new Pool(require.resolve('./entry'), {
  enabled: true
});

(async () => {
  const result = await pool.execute('fibonacci', 10);
  console.log('result: ' + result); // => result: 55
  await pool.close();
})();


```

### Advanced

`entry.js`

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return 'Hello ' + this.name;
  }

  // custom pack function for encoding
  static pack(person, encode) {
    return encode(person.name);
  }

  // custom unpack function for decoding
  static unpack(data, decode) {
    return new Person(decode(data));
  }
}

function createPerson(name) {
  return new Person(name);
}

module.exports = {
  // custom types for encoding and decoding
  types: [Person],
  // worker methods for remote calling
  methods: {
    createPerson,
  }
};

```

`app.js`
```js
const {Pool} = require('nworker');

const pool = new Pool(require.resolve('./entry'), {
  enabled: true
});

(async () => {
  const person = await pool.execute('createPerson', 'Tom');
  console.log(person.greet()); // => Hello Tom
  await pool.close();
})();

```

### Signal

`entry.js`
```js
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return 'Hello ' + this.name;
  }

  // custom pack function for encoding
  static pack(person, encode) {
    return encode(person.name);
  }

  // custom unpack function for decoding
  static unpack(data, decode) {
    return new Person(decode(data));
  }
}

let hinterval;

function start() {
  if (hinterval) return;
  let i = 0;
  hinterval = setInterval(() => {
    this.signal('person', new Person(i++));
  }, 500);
}

function stop() {
  if (!hinterval) return;
  clearInterval(hinterval);
  hinterval = null;
}

module.exports = {
  // custom types for encoding and decoding
  types: [Person],
  // worker methods for remote calling
  methods: {
    start,
    stop
  }
};

```

`app.js`
```js
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

```
