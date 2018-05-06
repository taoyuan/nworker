export class Person {
  constructor(public name: string) {
  }

  static pack(p: Person, encode) {
    return encode(p.name);
  }

  static unpack(input: Buffer, decode) {
    return new Person(decode(input));
  }
}
