export function GetMi() {
    return {
        test: undefined
    };
}

export function GetMumumu() {
    return {
        aaa: 0,
        mi: GetMi(),
        bbb: {}
    };
}
