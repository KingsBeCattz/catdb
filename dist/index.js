"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KatDataBase = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
class KatDataBase extends tiny_typed_emitter_1.TypedEmitter {
    path;
    tables;
    constructor(options) {
        super();
        this.path = options?.path || './database';
        this.tables = options?.tables ? options?.tables.concat('main') : ['main'];
    }
    getTable(name) {
        if (!this.isValidTable(name))
            throw new SyntaxError('CATDB: Invalid table was provided');
        try {
            let content = (0, node_fs_1.readFileSync)((0, node_path_1.join)(process.cwd(), this.path, 'tables', name + '.json'));
            if (!content)
                return null;
            let parsed = JSON.parse(content.toString());
            return parsed;
        }
        catch {
            return null;
        }
    }
    insert(name, data) {
        if (!(0, node_fs_1.existsSync)((0, node_path_1.join)(process.cwd(), this.path, 'tables', name))) {
            (0, node_fs_1.writeFileSync)((0, node_path_1.join)(process.cwd(), this.path, 'tables', name + '.json'), JSON.stringify({}));
        }
        (0, node_fs_1.writeFileSync)((0, node_path_1.join)(process.cwd(), this.path, 'tables', name + '.json'), JSON.stringify(data));
    }
    isValidTable(table) {
        return this.tables.includes(table);
    }
    start() {
        if (!(0, node_fs_1.existsSync)((0, node_path_1.join)(process.cwd(), this.path))) {
            (0, node_fs_1.mkdirSync)((0, node_path_1.join)(process.cwd(), this.path));
        }
        if (!(0, node_fs_1.existsSync)((0, node_path_1.join)(process.cwd(), this.path, 'tables'))) {
            (0, node_fs_1.mkdirSync)((0, node_path_1.join)(process.cwd(), this.path, 'tables'));
        }
        this.emit('start', this);
    }
    async Set(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let char = this.getTable(table) || {};
        lodash_1.default.set(char, key, value);
        this.insert(table, char);
        this.emit('set', key, value, table);
        return value;
    }
    async set(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        this.emit('set', key, value, await table);
        return this.Set(key, value, table);
    }
    async Get(key, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let char = this.getTable(table);
        if (!char)
            return undefined;
        let getted = lodash_1.default.get(char, key);
        return getted;
    }
    async get(key, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let getted = await this.Get(key, table);
        this.emit('get', key, table, await getted);
        return getted;
    }
    async Delete(key, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let char = this.getTable(table);
        if (!char)
            return false;
        let res = lodash_1.default.unset(char, key);
        this.insert(table, char);
        return res;
    }
    async delete(key, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let res = await this.Delete(key, table);
        this.emit('delete', key, table, await res);
        return res;
    }
    async Push(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let array = await this.Get(key, table) || [];
        if (array && !Array.isArray(array))
            throw new SyntaxError('CATDB: Provided key is not an array');
        let m = Array.isArray(array) ? 'concat' : 'push';
        array[m](value);
        this.Set(key, array, table);
        return array;
    }
    async push(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let array = await this.Push(key, value, table);
        this.emit('push', key, value, table, await array);
        return array;
    }
    async Remove(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let array = await this.Get(key, table);
        if (array && !Array.isArray(array))
            throw new SyntaxError('CATDB: Provided key is not an array');
        if (!array)
            return this.Set(key, [], table);
        if (Array.isArray(value))
            for (const v of value) {
                const index = array.indexOf(v);
                if (index > -1) {
                    array.splice(index, 1);
                }
            }
        else {
            const index = array.indexOf(value);
            if (index > -1) {
                array.splice(index, 1);
            }
        }
        return this.Set(key, array, table);
    }
    async remove(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let array = this.Remove(key, value, table);
        this.emit('remove', key, value, table, await array);
        return array;
    }
    async Shift(key, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let array = await this.Get(key, table);
        if (array && !Array.isArray(array))
            throw new SyntaxError('CATDB: Provided key is not an array');
        if (!array)
            return undefined;
        const res = array.shift();
        this.Set(key, array, table);
        return res;
    }
    async shift(key, table = 'main') {
        const res = this.Shift(key, table);
        this.emit('shift', key, table, await res);
        return res;
    }
    async unShift(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let array = await this.Get(key, table);
        if (array && !Array.isArray(array))
            throw new SyntaxError('CATDB: Provided key is not an array');
        if (!array)
            return undefined;
        if (!Array.isArray(value))
            value = [value];
        array.unshift(...value);
        return this.Set(key, array, table);
    }
    async unshift(key, value, table = 'main') {
        const res = this.unShift(key, value, table);
        this.emit('unshift', key, value, table, (await res));
        return res;
    }
    async Pop(key, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let array = await this.Get(key, table);
        if (array && !Array.isArray(array))
            throw new SyntaxError('CATDB: Provided key is not an array');
        if (!array)
            return undefined;
        const res = array.pop();
        this.Set(key, array, table);
        return res;
    }
    async pop(key, table = 'main') {
        const res = this.Pop(key, table);
        this.emit('pop', key, table, await res);
        return res;
    }
    async Add(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value))
            throw new SyntaxError('CATDB: Provided value is not a number');
        let n = await this.Get(key, table) || 0;
        if (n && isNaN(n))
            throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n + value), table);
    }
    async add(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Add(key, value, table);
        this.emit('add', key, value, table, await output);
        return output;
    }
    async Sub(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value))
            throw new SyntaxError('CATDB: Provided value is not a number');
        let n = await this.Get(key, table) || 0;
        if (n && isNaN(n))
            throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n - value), table);
    }
    async sub(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Sub(key, value, table);
        this.emit('sub', key, value, table, await output);
        return output;
    }
    async Multi(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value))
            throw new SyntaxError('CATDB: Provided value is not a number');
        let n = await this.Get(key, table) || 0;
        if (n && isNaN(n))
            throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n * value), table);
    }
    async multi(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Multi(key, value, table);
        this.emit('multi', key, value, table, await output);
        return output;
    }
    async Divide(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        if (isNaN(value))
            throw new SyntaxError('CATDB: Provided value is not a number');
        let n = await this.Get(key, table) || 0;
        if (n && isNaN(n))
            throw new SyntaxError('CATDB: Provided key is not a number');
        return this.Set(key, (n / value), table);
    }
    async divide(key, value, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        let output = this.Divide(key, value, table);
        this.emit('divide', key, value, table, await output);
        return output;
    }
    async has(key, table = 'main') {
        if (!this.isValidTable(table))
            throw new SyntaxError('CATDB: Invalid table was provided');
        return await this.Get(key, table) ? true : false;
    }
    async ping() {
        let before = Date.now();
        await this.Get('hi');
        return Date.now() - before;
    }
}
exports.KatDataBase = KatDataBase;
