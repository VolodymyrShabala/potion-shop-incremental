import { resolvePath } from '../../utility/pathResolver.js';

export class BindText extends HTMLElement {
    #unsub = null;

    connectCallback() {
        (this, wire());
    }

    disconnectCallback() {
        this.#unsub?.();
        this.#unsub = null;
    }

    static get observedAttributes() {
        return ['path', 'format'];
    }

    attributeChangedCallback() {
        this.#wire();
    }

    #wire() {
        this.disconnectCallback();

        const path = this.getAttribute('path');
        if (path == null) {
            return;
        }

        const value = resolvePath(window.game, path);
        if (value == null || typeof value.subscribe !== 'function') {
            this.textContent = `Missing: ${path}`;
            return;
        }

        const format = this.getAttribute('format') || 'raw';
        const formatValue = (v) => {
            if (format === 'int') {
                return String(Math.floor(v));
            }
            if (format === 'fixed2') {
                return Number(v).toFixed(2);
            }

            return String(v);
        };

        this.#unsub = value.subscribe((v) => {
            this.textContent = formatValue(v);
        });
    }
}

customElements.define('bind-text', BindText);
