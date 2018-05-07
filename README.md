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

exports.fibonacci = function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 2) + fibonacci(n - 1);
};

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
Advanced examples see [examples](examples)

## Benchmarks

To run benchmarks, run:

```bash
$ npm install
$ npm run benchmark
```

It will run a performance test against the selected libraries:

* data in: an object that consists of a single field that is a 0.5MB random string
* data out: received object stringified and concatenated with another 1MB string

Example results:

```
results for 100 executions

name                  time: total [ms]  time usr [ms]  time sys [ms]  worker usr [ms]  worker sys [ms]  mem rss [MB]  worker rss [MB]  errors
--------------------  ----------------  -------------  -------------  ---------------  ---------------  ------------  ---------------  ------
no-workers                         158            249             58                0                0           103                0       0
nworker-direct@0.1.0               158            285             66              281               65           102              102       0
nworker-spawn@0.1.0                812            829            407              247               80           263              105       0
worker-nodes@1.6.0                1449            710            412             1148              392           238              111       0
workerpool@2.3.0                  1553           1684            592              321               96           121               49       0
worker-farm@1.6.0                 2471           1614            508             1416              426            66               50       0
process-pool@0.3.5                2517           1816            529             1477              424            68               51       0
worker-pool@3.0.2                20362          25795           6863             2876              638            80               78       0

  os : Darwin / 17.5.0 / x64                        
 cpu : Intel(R) Core(TM) i7-4850HQ CPU @ 2.30GHz × 8
node : 10.0.0 / v8: 6.6.346.24-node.5  
```

## License

```
Copyright 2018 taoyuan <towyuan@outlook.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
