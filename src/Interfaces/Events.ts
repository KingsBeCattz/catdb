import { KatDataBase } from '../index'

export interface Events {
    start: (db: KatDataBase) => Promise<any> | any
    close: () => Promise<any> | any
    set: (key: string, value: any, table: string) => Promise<any> | any
    get: (key: string, table: string, output: any) => Promise<any> | any
    delete: (key: string, table: string, output: any) => Promise<any> | any
    push: (key: string, value: any, table: string, output: any) => Promise<any> | any
    remove: (key: string, value: any, table: string, output: any) => Promise<any> | any
    add: (key: string, value: number, table: string, output: any) => Promise<any> | any
    sub: (key: string, value: number, table: string, output: any) => Promise<any> | any
    has: (key: string, table: string, output: any) => Promise<any> | any
}