
interface Internal {
    foo: number;
    bar: string;
}

export interface Mi {
    id: string;
    test: 111;
    int: Internal;
}

export interface Mumumu {
    aaa: number;
    mi: Mi;
    id: string;
    bbb: {
        ccc?: string;
        name: string;
        age: number;
    }
}