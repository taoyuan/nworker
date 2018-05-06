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
