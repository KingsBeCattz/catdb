import { __importDefault } from 'tslib'
import { default as lodash } from "lodash"
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TypedEmitter } from "tiny-typed-emitter"

import { Events } from './Interfaces/Events'
import { KatDataBaseOptions } from './Interfaces/KatDataBaseOptions'

export class KatDataBase extends TypedEmitter<Events> {
    path: string;
    tables: string[];
    constructor(options: KatDataBaseOptions){
        super();
        this.path = options?.path || './database';
        this.tables = options?.tables ? options?.tables.concat('main') : ['main'];
    }
    getTable(name: (typeof this.tables)[number]) {
        if (!this.isValidTable(name)) throw new SyntaxError('CATDB: Invalid table was provided');
        try {
            let content = readFileSync(join(process.cwd(), this.path, 'tables', name + '.json'));
            if (!content)
                return null;
            let parsed = JSON.parse(content.toString());
            return parsed;
        }
        catch {
            return null;
        }
    }
    private insert(name: string, data: object) {
        if (!existsSync(join(process.cwd(), this.path, 'tables', name))) {
            writeFileSync(join(process.cwd(), this.path, 'tables', name + '.json'), JSON.stringify({}));
        }
        writeFileSync(join(process.cwd(), this.path, 'tables', name + '.json'), JSON.stringify(data));
    }
    isValidTable(table: (typeof this.tables)[number]) {
        return this.tables.includes(table);
    }
    start() {
        if (!existsSync(join(process.cwd(), this.path))) {
            mkdirSync(join(process.cwd(), this.path));
        }
        if (!existsSync(join(process.cwd(), this.path, 'tables'))) {
            mkdirSync(join(process.cwd(), this.path, 'tables'));
        }
        this.emit('start', this);
    }
    
    private async Set <T> (key: string, value: T, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let char = this.getTable(table) || {};
        lodash.set(char, key, value);
        this.insert(table, char)
        this.emit('set', key, value, table)
        return value
    }

    /**
     * Set a value
     */
    async set <T> (key: string, value: T, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        this.emit('set', key, value, await table)
        return this.Set(key, value, table)
    }

    /**
     * Gets a value from the provided key and table
     */
    private async Get (key: string, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let char = this.getTable(table)
        if(!char) return undefined;
        let getted = lodash.get(char, key)
        return getted;
    }

    /**
     * Gets a value from the provided key and table
     */
    async get (key: string, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let getted = await this.Get(key, table)
        this.emit('get', key, table, await getted)
        return getted;
    }

    /**
     * Deletes a key from the provided table
     * @returns boolean
     */
    private async Delete(key: string, table: typeof this.tables[number] = 'main'){
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let char = this.getTable(table)
        if(!char) return false
        let res = lodash.unset(char, key);
        this.insert(table, char)
        return res
    }

    /**
     * Deletes a key from the provided table
     * @returns boolean
     */
    async delete(key: string, table: typeof this.tables[number] = 'main'){
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let res = await this.Delete(key, table)
        this.emit('delete', key, table, await res)
        return res
    }

    /**
     * Pushs a value from the provided key and table
     */
    private async Push <T> (key: string, value: T | T[], table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let array: any[] = await this.Get(key, table) || [];
        if ( array && !Array.isArray(array)) throw new SyntaxError('CATDB: Provided key is not an array');
        let m: string = Array.isArray(array)?'concat':'push';
        array[m as any](value)
        this.Set(key, array, table);
        return array
    }

    /**
     * Pushs a value from the provided key and table
     */
    async push <T> (key: string, value: T | T[], table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let array = await this.Push(key, value, table)
        this.emit('push', key, value, table, await array)
        return array
    }

    private async Remove <T> (key: string, value: T | T[], table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let array: any[] = await this.Get(key, table);
        if ( array && !Array.isArray(array)) throw new SyntaxError('CATDB: Provided key is not an array');
        if ( !array ) return this.Set(key, [], table)
        if(Array.isArray(value)) for(const v of value) {
            const index = array.indexOf(v); if (index > -1) { array.splice(index, 1) }
        } else {const index = array.indexOf(value); if (index > -1) { array.splice(index, 1) }}
        return this.Set(key, array, table)
    }

    /**
     * Removes a value from the provided key and table
     */
    async remove <T> (key: string, value: T | T[], table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let array = this.Remove(key, value, table)
        this.emit('remove', key, value, table, await array)
        return array
    }

    private async Shift (key: string, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let array: any[] = await this.Get(key, table);
        if ( array && !Array.isArray(array)) throw new SyntaxError('CATDB: Provided key is not an array');
        if ( !array ) return undefined
        const res = array.shift()
        this.Set(key, array, table)
        return res
    }

    /**
     * Removes and return the first value from the provided key and table
     */
    async shift (key: string, table: typeof this.tables[number] = 'main') {
        const res = this.Shift(key, table)
        this.emit('shift', key, table, await res)
        return res
    }

    private async unShift <T> (key: string, value: T | T[], table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let array: any[] = await this.Get(key, table);
        if ( array && !Array.isArray(array)) throw new SyntaxError('CATDB: Provided key is not an array');
        if ( !array ) return undefined
        if(!Array.isArray(value)) value = [value]
        array.unshift(...(value as T[]));
        return this.Set(key, array, table)
    }

    /**
     * Adds values and return the new array value from the provided key and table
     */
    async unshift <T> (key: string, value: T | T[], table: typeof this.tables[number] = 'main') {
        const res = this.unShift(key, value, table)
        this.emit('unshift', key, value, table, (await res)!)
        return res
    }

    private async Pop (key: string, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let array: any[] = await this.Get(key, table);
        if ( array && !Array.isArray(array)) throw new SyntaxError('CATDB: Provided key is not an array');
        if ( !array ) return undefined
        const res = array.pop()
        this.Set(key, array, table)
        return res
    }

    /**
     * Removes and return the last value from the provided key and table
     */
    async pop (key: string, table: typeof this.tables[number] = 'main') {
        const res = this.Pop(key, table)
        this.emit('pop', key, table, await res)
        return res
    }

    private async Add (key: string, value: number, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value)) throw new SyntaxError('CATDB: Provided value is not a number');
        let n: number = await this.Get(key, table) || 0;
        if ( n && isNaN(n) ) throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n + value), table);
    }

    /**
     * Adds a value from the provided key and value
     */
    async add (key: string, value: number, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Add(key,value,table)
        this.emit('add', key, value, table, await output)
        return output
    }

    private async Sub (key: string, value: number, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value)) throw new SyntaxError('CATDB: Provided value is not a number');
        let n: number = await this.Get(key, table) || 0;
        if ( n && isNaN(n) ) throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n - value), table);
    }

    /**
     * Substracts a value from the provided key and value
     */
    async sub (key: string, value: number, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Sub(key,value,table)
        this.emit('sub', key, value, table, await output)
        return output
    }

    private async Multi (key: string, value: number, table: typeof this.tables[number] = 'main'){
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value)) throw new SyntaxError('CATDB: Provided value is not a number');
        let n: number = await this.Get(key, table) || 0;
        if ( n && isNaN(n) ) throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n * value), table);
    }

    /**
     * Multiply a value from the provided key and table
     */
    async multi (key: string, value: number, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Multi(key,value,table)
        this.emit('multi', key, value, table, await output)
        return output
    }

    private async Divide (key: string, value: number, table: typeof this.tables[number] = 'main'){
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value)) throw new SyntaxError('CATDB: Provided value is not a number');
        let n: number = await this.Get(key, table) || 0;
        if ( n && isNaN(n) ) throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n / value), table);
    }

    /**
     * Divide a value from the provided key and table
     */
    async divide (key: string, value: number, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Divide(key,value,table)
        this.emit('divide', key, value, table, await output)
        return output
    }

    /**
     * Verify if the key exists in provided table
     */
    async has (key: string, table: typeof this.tables[number] = 'main') {
        if (!this.isValidTable(table)) throw new SyntaxError('CATDB: Invalid table was provided');
        return await this.Get(key, table) ? true : false;
    }

    /**
     * Gets the latency of the database
     */
    async ping () {
        let before = Date.now();
        await this.Get('hi');
        return Date.now() - before;
    }
}