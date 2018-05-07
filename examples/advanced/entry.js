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

// custom types for encoding and decoding
exports.codecs = [Person];

exports.createPerson = name => new Person(name);

