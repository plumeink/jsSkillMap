const assert = require('assert');

function deepClone(obj, hash = new WeakMap()) {
    if (Object(obj) !== obj) {
        return obj; // 基本类型直接返回
    }

    // 如果对象已经被拷贝过，则直接返回之前的拷贝结果，避免循环引用
    if (hash.has(obj)) {
        return hash.get(obj);
    }

    let clone;
    const type = Object.prototype.toString.call(obj);

    if (type === '[object Date]') {
        clone = new Date(obj.getTime());
    } else if (type === '[object RegExp]') {
        clone = new RegExp(obj.source, obj.flags);
    } else if (type === '[object Map]') {
        clone = new Map(Array.from(obj, ([key, value]) => [key, deepClone(value, hash)]));
    } else if (type === '[object Set]') {
        clone = new Set(Array.from(obj, value => deepClone(value, hash)));
    } else if (type === '[object Object]') {
        clone = Object.create(Object.getPrototypeOf(obj));
        hash.set(obj, clone); // 记录拷贝过的对象

        for (const key of Object.keys(obj)) {
            clone[key] = deepClone(obj[key], hash);
        }
    } else if (type === '[object Array]') {
        clone = [];
        hash.set(obj, clone); // 记录拷贝过的对象

        for (let i = 0; i < obj.length; i++) {
            clone[i] = deepClone(obj[i], hash);
        }
    } else {
        return obj; // 无法拷贝的类型直接返回
    }

    return clone;
}

const original = {
    string: 'hello',
    number: 123,
    boolean: true,
    null: null,
    undefined: undefined,
    function: function() {},
    array: [1, 2, 3],
    object: { a: 1, b: 2 },
    date: new Date(),
    regex: /hello/gi,
    map: new Map([['a', 1], ['b', 2], ['c', { d: 3 }]]),
    set: new Set([1, 2, { a: 3 }]),
    symbol: Symbol('test'),
};

original.obj = original;

const cloned = deepClone(original);

// 比较对象
assert.deepStrictEqual(cloned, original);

// 比较日期对象
assert(cloned.date instanceof Date);
assert.strictEqual(cloned.date.getTime(), original.date.getTime());

// 比较正则表达式
assert(cloned.regex instanceof RegExp);
assert.strictEqual(cloned.regex.source, original.regex.source);
assert.strictEqual(cloned.regex.flags, original.regex.flags);

// 比较 Map 对象
assert(cloned.map instanceof Map);
assert.deepStrictEqual(Array.from(cloned.map.entries()), Array.from(original.map.entries()));

// 比较 Set 对象
assert(cloned.set instanceof Set);
assert.deepStrictEqual(Array.from(cloned.set), Array.from(original.set));

// 比较 Symbol
assert(typeof cloned.symbol === 'symbol');

console.log('All tests passed.');
