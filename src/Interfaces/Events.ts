import { KatDataBase } from '../index'

export interface Events {
    start: (db: KatDataBase) => Promise<any> | any
    close: () => Promise<any> | any
    set: (key: string, value: any, table: string) => Promise<any> | any
    get: (key: string, table: string, output: any) => Promise<any> | any
    delete: (key: string, table: string, output: any) => Promise<any> | any
    push: (key: string, value: any | any[], table: string, output: any[]) => Promise<any> | any
    remove: (key: string, value: any | any[], table: string, output: any[]) => Promise<any> | any
    shift: (key: string, table: string, output: any) => Promise<any> | any
    unshift: (key: string, value: any | any[], table: string, output: any[]) => Promise<any> | any
    pop: (key: string, table: string, output: any) => Promise<any> | any
    add: (key: string, value: number, table: string, output: number) => Promise<any> | any
    sub: (key: string, value: number, table: string, output: number) => Promise<any> | any
    multi: (key: string, value: number, table: string, output: number) => Promise<any> | any
    divide: (key: string, value: number, table: string, output: number) => Promise<any> | any
    has: (key: string, table: string, output: any) => Promise<any> | any
}