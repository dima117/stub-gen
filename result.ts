export function GetMi() {
    return {
        id: "0",
        test: undefined
    };
}

export function GetMumumu() {
    return {
        aaa: 0,
        mi: GetMi(),
        id: "1",
        bbb: {}
    };
}
