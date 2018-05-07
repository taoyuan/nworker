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

export function sum(...params: number[]): number {
  let result = 0;
  for (let i = 0; i < params.length; i++) {
    result += params[i];
  }
  return result;
}

export function person(name: string) {
  return new Person(name);
}

export function greet(person: Person) {
  return 'Hello ' + person.name;
}

export const codecs = [Person];
