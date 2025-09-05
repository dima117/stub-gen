export function GetStub_Mi() {
    return {
        id: "0",
        test: undefined,
        int: {}
    };
}

export function GetStub_Mumumu() {
    return {
        aaa: 0,
        mi: GetStub_Mi(),
        id: "1",
        bbb: {}
    };
}
