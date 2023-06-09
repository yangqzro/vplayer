import { isFunction, isNil, isObject } from "lodash-es";
import { Component } from "../Components/Component";

const insStack: Component[] = [];
const updateStack: (() => void)[] = [];

let updTimedTask: Promise<any> | null = null;
function cleanStack() {
    insStack.length = 0;
    updateStack.length = 0;
    updTimedTask = null;
}

function createUpdateTasks() {
    return Promise.resolve().then(() => {
        const insLen = insStack.length;
        const updateLen = updateStack.length;
        const len = Math.min(insLen, updateLen);

        for (let i = 0; i < len; i++) {
            const updateTask = updateStack.pop();
            const ins = insStack.pop();
            if (isFunction(updateTask) && isObject(ins)) {
                updateTask.call(ins);
            }
        }

        cleanStack();
    });
}

const afterTaskStack: Set<(...args: any[]) => any> = new Set();
let ntkTimedTask: Promise<any> | null = null;

function createTasksAfterUpdate() {
    return Promise.resolve().then(() => {
        afterTaskStack.forEach(cb => cb.call(null));
        afterTaskStack.clear();
        ntkTimedTask = null;
    });
}

export function nextTick(cb: (...args: any[]) => any) {
    afterTaskStack.add(cb);
}

export function addUpdateQueue(ins: Component, updateTask: () => void) {
    if (insStack.includes(ins)) return;
    insStack.push(ins);
    updateStack.push(updateTask);

    if (isNil(updTimedTask) && insStack.length !== 0 && updateStack.length !== 0) {
        updTimedTask = createUpdateTasks();
    }

    if (isNil(ntkTimedTask) && afterTaskStack.size !== 0) {
        ntkTimedTask = createTasksAfterUpdate();
    }
}
