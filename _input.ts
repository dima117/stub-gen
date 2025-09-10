
interface Internal {
    foo: number;
    bar: string;
    boo: boolean;
    test: 'test';
    testnum: 1234;
    testbool: false;
    testUnion: 'one' | 'two' | 'three';
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