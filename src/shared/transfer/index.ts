import { has } from "lodash-es";
import { warn } from "../error";

const provider: Record<string, any> = {};

interface ProvideOptions {
    ignoreWarn: boolean;
}

export function provide(key: string, value: any, options: ProvideOptions = { ignoreWarn: false }) {
    if (!options.ignoreWarn && has(provider, key)) {
        warn(`The ${key} already exists, are you sure it's correct?`);
    }
    provider[key] = value;
}

export function inject(key: string) {
    if (!has(provider, key)) {
        // warn(`The key: ${key} doesn't exist, are you sure it's correct?`);
        return null;
    }
    return provider[key];
}
