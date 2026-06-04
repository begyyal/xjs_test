[![npm][npm-badge]][npm-url] [![CI][ci-badge]][ci-url] [![publish][publish-badge]][publish-url]

# Overview
simple testing framework for typescript modules.  
this has been used for xjs series like [xjs-common](https://github.com/begyyal/xjs_common).

# Install
```
npm i xjs-test --save-dev
```

# Code example (only part)
below is a part of actual unit test in [xjs-common](https://github.com/begyyal/xjs_common).  
there is more code examples as actual tests in [here](https://github.com/begyyal/xjs_common/tree/main/src/test).
```ts
const mt = new ModuleTest("T_U");
mt.appendUnit("retry", function (this: TestUnit<{
    counter: number,
    errorCount: number,
    array: number[];
    cb?: () => any,
    cbAsync?: () => Promise<any>
}>) {
    this.chainContextGen(c => ({
        counter: 0,
        errorCount: 2,
        array: [],
        cb: () => { c.counter += 1; return c.counter; }
    }));
    this.appendCase("result value from callback is returned correctly.", function (this: TestCase, c) {
        this.check(retry(c.cb, { count: 2, logger: s_emptyLogger }) === 1);
    });
    this.chainContextGen(c => ({
        cb: () => {
            c.counter += 1;
            if (c.counter <= c.errorCount) throw c.counter;
            return c.counter;
        }
    }));
    this.appendCase("callback is retried by default retryable count correctly.", function (this: TestCase, c) {
        this.expectError(e => e === 2);
        retry(c.cb, { logger: s_emptyLogger });
    });
    this.appendCase("specified retry count is working.", function (this: TestCase, c) {
        const ret = retry(c.cb, { count: 2, logger: s_emptyLogger });
        this.check(ret === 3);
    });
    this.chainContextGen(c => ({
        cbAsync: async () => {
            c.array.push(c.counter);
            await delay(0.001).then(() => c.counter += 1);
            if (c.counter <= c.errorCount) throw 1;
            return c.counter;
        }
    }));
    this.appendCase("async callback is working.", async function (this: TestCase, c) {
        const ret = await retry(c.cbAsync, { count: 2, logger: s_emptyLogger });
        this.check(ret === 3);
    });
    this.appendCase("error criterion is working.", async function (this: TestCase, c) {
        try { await retry(c.cbAsync, { errorCriterion: e => e != 1, logger: s_emptyLogger }); } catch { /** pass here is correct. */ }
        this.check(c.counter === 1);
    });
    this.appendCase("interval predicate is working.", async function (this: TestCase, c) {
        try {
            await retry(c.cbAsync, {
                intervalPredicate: () => delay(0.001).then(() => c.array.push(-1)),
                errorCriterion: e => e === 1, logger: s_emptyLogger, count: 2
            });
        } catch { }
        this.check(UArray.eq(c.array, [0, -1, 1, -1, 2], { sort: false }));
    });
    this.chainContextGen(() => ({
        cb: () => { throw 1; },
        array: [Date.now()]
    }));
    this.appendCase("intervalSec is working.", async function (this: TestCase, c) {
        try {
            await retry(c.cb, {
                intervalSec: 0.5,
                intervalPredicate: () => c.array.push(Date.now()),
                errorCriterion: e => e === 1, logger: s_emptyLogger, count: 2
            });
        } catch { }
        this.check(c.array[2] - c.array[1] >= 500 && c.array[1] - c.array[0] < 500);
    });
}, { concurrent: true });
mt.exe();
```

# License
[Apache-License](./LICENSE)

[npm-url]: https://npmjs.org/package/xjs-test
[npm-badge]: https://badgen.net/npm/v/xjs-test
[ci-url]: https://github.com/begyyal/xjs_test/actions/workflows/test.yml
[ci-badge]: https://github.com/begyyal/xjs_test/actions/workflows/test.yml/badge.svg
[publish-url]: https://github.com/begyyal/xjs_test/actions/workflows/publish.yml
[publish-badge]: https://github.com/begyyal/xjs_test/actions/workflows/publish.yml/badge.svg
