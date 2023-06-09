import { has, isNil } from "lodash-es";

type CallBack = (...args: any[]) => any;
export type EventsDefaultDef = Record<string, (...args: any[]) => any>;
export type EventStore = Record<string, Set<CallBack>>;
/**
 * Converts an interface defined type to a literal type.
 * It helps you to be compatible with an index type.
 */
export type Literal<T extends object> = {
    [K in keyof T]: T[K];
};

/**
 * Creates an event emitter.
 */
export class Events<EventsDef extends EventsDefaultDef = EventsDefaultDef> {
    /**
     * Stores event and callbacks of event.
     * Set it private: avoid being overridden by subclass.
     */
    private readonly $events: EventStore = {};
    private readonly _eventsCache: EventStore = {};

    /**
     * Checks if `event` is registered.
     * @param event Event name.
     * @returns Returns `true` if `event` exists, else `false`.
     */
    $has(event: string): boolean {
        return has(this.$events, event);
    }

    /**
     * Registers and listens for an event.
     * @param event Event name.
     * @param callbacks Callbacks to be stored. These `callbacks` will be called when this `event` is emitted.
     */
    $on<EventName extends keyof EventsDef>(event: EventName, callback: EventsDef[EventName]): void;
    $on<EventName extends keyof EventsDef>(event: EventName, ...callbacks: EventsDef[EventName][]) {
        const evt = event as string;
        if (!this.$has(evt)) this.$events[evt] = new Set<CallBack>();
        for (let i = 0, len = callbacks.length; i < len; i++) {
            this.$events[evt].add(callbacks[i]);
        }
    }

    /**
     * Emits an event.
     * @param event Event name. If `event` is not registered, nothing to do.
     * @param args Arguments passed to callback.
     */
    $emit<EventName extends keyof EventsDef>(event: EventName, ...args: Parameters<EventsDef[EventName]>) {
        const evt = event as string;
        if (!this.$has(evt)) return;
        // Todo: return a result array of callbacks
        this.$events[evt].forEach(callback => callback.apply(null, args));
    }

    /**
     * Cancels all events or removes all callbacks of `event`.
     * @param event Event name. If not, cancel all events.
     */
    $off<EventName extends keyof EventsDef>(event?: EventName): void;
    /**
     * Removes `callback` of `event`.
     * @param event Event name.
     * @param callback Callback to be removed.
     */
    $off<EventName extends keyof EventsDef>(event: EventName, callback: EventsDef[EventName]): void;
    /**
     * Removes `callbacks` of `event`.
     * @param event Event name.
     * @param callbacks Callbacks to be removed. If not, remove all callbacks of this `event`.
     */
    $off<EventName extends keyof EventsDef>(event: EventName, ...callbacks: EventsDef[EventName][]): void;
    $off<EventName extends keyof EventsDef>(...args: (EventName | EventsDef[EventName])[]) {
        const event = args[0] as string;
        if (isNil(event)) {
            // cancel all events
            Object.keys(this.$events).forEach(key => {
                delete this.$events[key];
            });
            return;
        }

        // If event is not registered, nothing to do.
        if (!this.$has(event)) return;

        const callbacks = args.slice(1) as CallBack[];
        // If callbacks is empty, remove all callbacks of event.
        if (callbacks.length === 0) {
            delete this.$events[event];
            return;
        }

        // If callbacks is't empty, remove them.
        const events = this.$events[event];
        for (let i = 0, len = callbacks.length; i < len; i++) {
            if (events.has(callbacks[i])) events.delete(callbacks[i]);
        }
    }

    $forEach<EventName extends keyof EventsDef>(
        callback: (event: EventName, callbackSet?: Set<EventsDef[EventName]>) => any
    ) {
        Object.keys(this.$events).forEach(event => {
            callback.call(null, event as EventName, this.$events[event] as Set<EventsDef[EventName]>);
        });
    }

    $shelve<EventName extends keyof EventsDef>(event: EventName) {
        const evt = event as string;
        if (!this.$has(evt) || has(this._eventsCache, evt)) return;
        const cacheSet = (this._eventsCache[evt] = new Set<CallBack>());
        this.$events[evt].forEach(callback => {
            cacheSet.add(callback);
        });
        this.$events[evt].clear();
    }

    $reOn<EventName extends keyof EventsDef>(event: EventName) {
        const evt = event as string;
        if (!this.$has(evt) || !has(this._eventsCache, evt)) return;
        this._eventsCache[evt].forEach(callback => {
            this.$events[evt].add(callback);
        });
        delete this._eventsCache[evt];
    }
}
