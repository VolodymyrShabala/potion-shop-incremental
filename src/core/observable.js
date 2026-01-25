export class ObservableValue {
    #value;
    #subs = new Set();

    constructor(initialValue) {
        this.#value = initialValue;
    }

    get value() {
        return this.#value;
    }

    set value(next) {
        if (Object.is(this.#value, next)) {
            return;
        }

        this.#value = next;
        for (const fn of this.#subs) {
            fn(next);
        }
    }

    subscribe(fn, { emitImmediately = true } = {}) {
        this.#subs.add(fn);
        if (emitImmediately) {
            fn(this.#value);
        }

        return () => this.#subs.delete(fn);
    }
}

export function computed(getter, deps) {
    const out = new ObservableValue(getter());

    const recompute = () => (out.value = getter());
    const unsubs = deps.map((d) =>
        d.subscribe(recompute, { emitImmediately: false })
    );

    out.value = getter();
    out.dispose = () => unsubs.forEach((u) => u());
    return out;
}
