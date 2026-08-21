
export class TestCase<C = any> {
    private errorExpected = false;
    private errorTest?: (e: any) => boolean;
    get desc() { return `[${this.moduleName}.${this.name}] "${this._title}"`; }
    constructor(
        readonly moduleName: string,
        readonly name: string,
        private readonly _title: string,
        private readonly _case: (this: TestCase, context: Partial<C>) => void | Promise<void>,
        private readonly _cg: () => Partial<C>,
        readonly op?: { concurrent?: boolean }) { }
    expectError(test?: (e: any) => boolean): void {
        this.errorExpected = true;
        this.errorTest = test;
    }
    check(valid: boolean, additional?: () => any): void {
        if (!valid) {
            if (additional) console.error(`${this.desc} | additional => ${additional()}`);
            throw new Error(`${this.desc} returned false.`);
        }
    }
    async exe(): Promise<void> {
        let err = null;
        try { await this._case.bind(this)(this._cg()); }
        catch (e) { err = e; }
        if (err && !this.errorExpected)
            throw (err instanceof Error && err.message?.startsWith(this.desc) ? err : new Error(`${this.desc} throws unhandled exception.`, { cause: err }));
        else if (this.errorExpected)
            if (!err) throw new Error(`${this.desc} didn't throw an error but expected to.`);
            else if (this.errorTest && !this.errorTest(err))
                throw new Error(`${this.desc} throws an error as expected but the thrown value was not expected.`);
    }
}