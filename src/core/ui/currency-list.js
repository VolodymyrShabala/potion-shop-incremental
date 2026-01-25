import { resolvePath } from '../../utility/pathResolver.js';

export class CurrencyList extends HTMLElement {
    #unsubs = [];
    #pending = false;

    connectedCallback() {
        this.#wire();
    }

    disconnectedCallback() {
        for (const fn of this.#unsubs) {
            fn();
        }
        this.#unsubs = [];
    }

    static get observedAttributes() {
        return ['path', 'format', 'show-per-sec'];
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.#wire();
        }
    }

    #requestRewire() {
        if (this.#pending) return;
        this.#pending = true;
        queueMicrotask(() => {
            this.#pending = false;
            this.#wire();
        });
    }

    #wire() {
        this.disconnectedCallback();

        const path = this.getAttribute('path');
        if (path == null) {
            return;
        }

        const currencies = resolvePath(window.game, path);
        if (currencies == null || typeof currencies !== 'object') {
            this.textContent = `Missing: ${path}`;
            return;
        }

        for (const currency of Object.values(currencies)) {
            if (currency?.isUnlocked?.subscribe) {
                this.#unsubs.push(
                    currency.isUnlocked.subscribe(
                        (unlocked) => {
                            if (unlocked === true) this.#requestRewire();
                        },
                        { emitImmediately: false }
                    )
                );
            }
        }

        const showPerSec = this.hasAttribute('show-per-sec');
        const format = this.getAttribute('format') ?? 'int';

        const fmt = (v) => {
            if (format === 'fixed2') {
                return Number(v).toFixed(2);
            }

            return String(Math.floor(v));
        };

        const parts = [];
        const entries = Object.entries(currencies).filter(
            ([_, currency]) => currency?.isUnlocked.value === true
        );
        entries.forEach(([id, currency], index) => {
            if (index > 0) {
                parts.push(document.createTextNode(' '));
            }

            const row = document.createElement('div');
            row.className = 'currency-row';

            const amountEl = document.createElement('strong');
            amountEl.textContent = '?';

            const nameEl = document.createElement('span');
            nameEl.textContent = ` ${currency.name ?? id}`;

            row.appendChild(amountEl);
            row.appendChild(nameEl);

            let perSecEl = null;
            if (showPerSec) {
                perSecEl = document.createElement('span');
                perSecEl.className = 'muted';
                perSecEl.textContent = ' (+?/s)';
                row.appendChild(perSecEl);
            }

            parts.push(row);

            if (currency.amount?.subscribe) {
                this.#unsubs.push(
                    currency.amount.subscribe((v) => {
                        amountEl.textContent = fmt(v);
                    })
                );
            }

            if (showPerSec && perSecEl && currency.amountPerSec?.subscribe) {
                this.#unsubs.push(
                    currency.amountPerSec.subscribe((v) => {
                        perSecEl.textContent = ` (+${fmt(v)}/s)`;
                    })
                );
            }
        });

        this.replaceChildren(...parts);
    }
}

customElements.define('currency-list', CurrencyList);
