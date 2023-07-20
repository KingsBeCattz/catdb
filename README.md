# katdb
A Database using json files and tables, same usage like quickdb

## Contact me
<a href="https://discord.com/users/1125490330679115847"><img src="https://img.shields.io/badge/-Discord-000000?labelColor=5568f2&logo=discord&logoColor=ffffff" alt="Discord Badge"/></a>
<a href="https://twitter.com/kingsbcats"><img src="https://img.shields.io/badge/-Twitter-000000?labelColor=1da1f2&logo=twitter&logoColor=ffffff" alt="Twitter Badge"/></a>
<a href="https://instagram.com/kingsbcattz"><img src="https://img.shields.io/badge/-Instagram-000000?labelColor=E4405F&logo=instagram&logoColor=ffffff" alt="Instagram Badge"/></a>

## Install
```fix
npm i katdb
```

## Setup (Using CommonJS):
```js
const { KatDataBase } = require('katdb')

const db = new KatDataBase({ //Create the a new database instance
    path: './Database',
    tables: ['main']
})

db.on('start', () => {
    console.log('Database is ready!')
})

db.start() // let's start the class
```

## Events
The package has events for each function except `getTable`, `isValidTable`, `insert`, `ping` and `has`.
- Structure of an event is:
```js
db.on('function', (...args) => { /*any*/ })
```
- Example using `set`, `get` and push:
```js
db.on('set', (key, value, table) => { /*any*/ })
db.on('get', (key, table, res) => { /*any*/ })
db.on('push', (key, value, table, res) => { /*any*/ })
```
The args depend on the function but are the same, except that at the end it is always what the function returns

## Methods
### Set
Sets a value from the provided key on the table (Default table: `main`)
- Usage: `set (key: string, value: any, table: string)`
- Example:
```js
db.set('kingsbecats',{owner:true},'users') // Returns: {owner:true} (Promise)
db.set('kingsbecats.dev',true,'users') // Returns: true (Promise)
//Table: { "kingsbecats": { "owner": true, "dev": true } }
```

### Get
Gets a value from the provided key on the table (Default table: `main`)
- Usage: `get (key: string, table: string)`
- Example:
```js
db.get('kingsbecats','users') // Returns: { "owner": true, "dev": true } (Promise)
db.get('kingsbecats.owner','users') // Returns: true (Promise)
db.get('kingsbecats.dev','users') // Returns: true (Promise)
```

### Delete
Deletes a value from the provided key on the table (Default table: `main`)
- Usage: `delete (key: string, table: string)`
- Example:
```js
//Before: { "kingsbecats": { "owner": true, "dev": true } }
db.delete('kingsbecats.dev','users')
//After: { "kingsbecats": { "owner": true } }
```

### Push
Pushs a value from the provided key on the table (Default table: `main`)
- Usage: `push (key: string, value: any, table: string)`
- Example:
```js
db.push('kingsbecats.packages','katdb','users') // Returns: [ 'katdb' ] (Promise)
db.push('kingsbecats.packages','hybridcommands','users') // Returns: [ 'katdb', 'hybridcommands' ] (Promise)
```

### Remove
Removes a value from the provided key on the table (Default table: `main`)
- Usage: `remove (key: string, value: any, table: string)`
- Example:
```js
db.remove('kingsbecats.packages','katdb','users') // Returns: [ 'hybridcommands' ] (Promise)
db.remove('kingsbecats.packages','hybridcommands','users') // Returns: [ ] (Promise)
```

### Shift
Removes and returns the first value from the provided key on the table (Default table: `main`)
- Usage: `shift (key: string, table: string)`
- Example:
```js
db.get('kingsbecats.packages','users') // Returns: [ 'katdb', 'hybridcommands' ] (Promise)
db.shift('kingsbecats.packages','users') // Returns: 'katdb' (Promise)
db.get('kingsbecats.packages','users') // Returns: [ 'hybridcommands' ] (Promise)
```

### Pop
Removes and returns the last value from the provided key on the table (Default table: `main`)
- Usage: `pop (key: string, table: string)`
- Example:
```js
db.get('kingsbecats.packages','users') // Returns: [ 'katdb', 'hybridcommands' ] (Promise)
db.pop('kingsbecats.packages','users') // Returns: 'hybridcommands' (Promise)
db.get('kingsbecats.packages','users') // Returns: [ 'katdb' ] (Promise)
```

### unShift
Adds at the begging the provided values from the provided key on the table (Default table: `main`)
- Usage: `unshift (key: string, value: any, table: string)`
- Example:
```js
db.get('kingsbecats.packages','users') // Returns: [ 'hybridcommands' ] (Promise)
db.unshift('kingsbecats.packages','katdb','users') // Returns: [ 'katdb', 'hybridcommands' ] (Promise)
```

### Add
Adds a value from the provided key and table (Default table: `main`)
- Usage: `add (key: string, value: number, table: string)`
- Example:
```js
db.add('kingsbecats.money',5,'users') // Returns: 5 (Promise)
```

### Sub
Substracts a value from the provided key and table (Default table: `main`)
- Usage: `sub (key: string, value: number, table: string)`
- Example:
```js
db.sub('kingsbecats.money',1,'users') // Returns: 4 (Promise)
```

### Multi
Multiply a value from the provided key and table (Default table: `main`)
- Usage: `multi (key: string, value: number, table: string)`
- Example:
```js
db.multi('kingsbecats.money',2,'users') // Returns: 8 (Promise)
```

### Divide
Divide a value from the provided key and table (Default table: `main`)
- Usage: `divide (key: string, value: number, table: string)`
- Example:
```js
db.divide('kingsbecats.money',2,'users') // Returns: 4 (Promise)
```

### Has
Verify if the key exists in provided table (Default table: `main`)
- Usage: `has (key: string, table: string)`
- Example:
```js
db.has('kingsbecats','users') // Returns: true (Promise)
db.has('kingsbecats.owner','users') // Returns: false (Promise)
db.has('kingsbecats.dev','users') // Returns: true (Promise)
```

### Ping
Gets the latency of the database
- Usage: `has ()`
- Example:
```js
db.ping() // Returns: 3 (Promise)
```

### GetTable
Gets all data in the provided table
- Usage: `getTable (name: string)`
- Example:
```js
db.getTable('users') // Returns: { 'kingsbecats' : { owner : true, money : 4, packages : [ ] } } (Promise)
```

### Start
Starts the database
- Usage: `start ()`
- Example:
```js
db.start() // Returns: void
```