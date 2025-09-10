export function GetStubAccount() {
    return {
        id: "0",
        test: 111,
        int: { foo: 0, bar: "", boo: false, test: "test", testnum: 1234, testbool: false, testUnion: "one" }
    };
}

export function GetStubResponse() {
    return {
        aaa: 0,
        account: GetStubAccount(),
        id: "1",
        bbb: { ccc: "", name: "", age: 0 }
    };
}
