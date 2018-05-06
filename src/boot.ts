import {Booter} from "./booter";

if (!process.argv[2]) {
  console.error('module for boot is require');
  process.exit(1);
}

const booter = new Booter(process.argv[2]);
(async () => booter.boot())();

