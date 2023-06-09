import { has, isEqual, isFunction, isNil, isObject } from "lodash-es";

export type Reactive<T extends object = {}> = T & {
    readonly _is_reactive: boolean;
    readonly _key: Reactive;
};

export interface WatchOptions {
    immediately: boolean;
}

// /**
//  * checks if value is a reactive object (created by {@link reactive}).
//  * @param value the value to check.
//  */
export function isReactive(value: any): value is Reactive {
    return isObject(value) && has(value, "_is_reactive") && (value as { _is_reactive: boolean })._is_reactive;
}

export function reactive<T extends object>(raw: T, key?: Reactive) {
    // already a reactive object, just return it.
    if (isReactive(raw)) return raw;

    // create a reactive object based on raw.
    const p = new Proxy(raw, {
        get(target: object, key: string | symbol) {
            return Reflect.get(target, key);
        },
        deleteProperty(target: object, key: string | symbol) {
            const result = Reflect.deleteProperty(target, key);
            trigger(p);
            return result;
        },
        set(target: object, key: string | symbol, newValue: any) {
            const oldValue = Reflect.get(target, key);
            const result = Reflect.set(target, key, newValue);
            if (!isEqual(oldValue, newValue)) {
                trigger(p);
            }
            if (isObject(newValue) && !isFunction(newValue)) {
                newValue = reactive(newValue, p._key);
            }
            return result;
        },
    }) as Reactive<T>;

    // @ts-ignore: mark result as a reactive object for check.
    p._is_reactive = true;
    // @ts-ignore: set key for look cbs in Keeper. These cbs will be triggered when the property changes.
    p._key = key || p;

    // recurse. if the property is an object, “reactive” it, too.
    Object.keys(p).forEach(k => {
        // @ts-ignore
        if (isObject(p[k])) p[k] = reactive(p[k], p._key);
    });

    return p;
}

const triggerMap = new WeakMap<Reactive, Set<Function>>();

export function watch(value: Reactive, cb: Function, watchOptions?: WatchOptions) {
    if (!triggerMap.has(value)) triggerMap.set(value, new Set());
    triggerMap.get(value)!.add(cb);

    if (!isNil(watchOptions) && watchOptions.immediately) {
        cb.call(null);
    }
}

export function trigger(target: Reactive) {
    // if triggerKeeper has no key, nothing to do.
    if (!triggerMap.has(target._key)) return;
    const cbSet = triggerMap.get(target._key)!;
    cbSet.forEach(cb => cb.call(null));
}

// export function clean<T>(key: ReactiveObject, cb?: Trigger<T>) {
//     if (!triggerKeeper.has(key)) return;
//     if (isNil(cb)) {
//         triggerKeeper.delete(key);
//         return;
//     }
//     const cbs = triggerKeeper.get(key)!;
//     for (let i = 0, len = cbs.length; i < len; i++) {
//         if (cb !== cbs[i]) continue;
//         cbs.splice(i, 1);
//     }
// }

// reactive.test.ts
// const person = reactive({ name: "张三", age: 18, a: { k: 2 } });
// watch(person, () => {
//     console.log(person);
// });
// person.a.k = 20;
