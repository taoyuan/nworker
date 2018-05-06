import {Person} from "./types";

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
