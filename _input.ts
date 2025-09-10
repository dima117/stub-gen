
interface Internal {
    foo: number;
    bar: string;
}

export interface Account {
    id: string;
    test: 111;
    int: Internal;
}

export interface Response {
    aaa: number;
    account: Account;
    id: string;
    bbb: {
        ccc?: string;
        name: string;
        age: number;
    }
}