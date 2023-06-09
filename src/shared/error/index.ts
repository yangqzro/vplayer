export function warn(msg: string, ...args: any[]) {
    console.warn(`[VPlayer warn] ${msg}`, ...args);
}

export function error(msg: string, ...args: any[]) {
    console.error(`[VPlayer error] ${msg}`, ...args);
}
