import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as uniq from 'lodash.uniq';
import {Pool} from "../src";


chai.use(chaiAsPromised);

const pools: Array<Pool> = [];

export function unique(...args) {
  return uniq(...args);
}

export function wait(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

export function fixture(name: string): string {
  return require.resolve('./fixtures/' + name)
}

export function throwError(err: Error) {
  throw err;
}

export function givenWorkerPoolWith(script: string, options: any): Pool {
  const pool = new Pool(fixture(script), options);
  pools.push(pool);
  return pool;
}

export async function close() {
  while (pools.length) {
    const pool = pools.pop();
    pool && await pool.close();
  }
}

export async function repeat(times, fn) {
  const arr = new Array(times).fill(0);
  return Promise.all(arr.map(() => fn()));
}
