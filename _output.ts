export function GetStubAccount() {
    return {
        id: "0",
        test: undefined,
        int: { foo: 0, bar: "" }
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
