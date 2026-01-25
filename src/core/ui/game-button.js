import { resolvePath } from '../../utility/pathResolver.js';

export class GameButton extends HTMLElement {
    #unsub = null;

    connectedCallback() {
        this.#wire();
    }

    disconnectedCallback() {
        this.#unsub?.();
        this.#unsub = null;
    }

    static get observedAttributes() {
        return ['label', 'target', 'enabled', 'method'];
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.#wire();
        }
    }

    #wire() {
        this.disconnectedCallback();

        const targetPath = this.getAttribute('target');
        const methodName = this.getAttribute('method');
        const enabledPath = this.getAttribute('enabled');
        const label = this.getAttribute('label') ?? methodName ?? 'Button';

        // V: Render
        this.innerHTML = `<button class="btn"></button>`;
        const button = this.querySelector('button');
        if (button == null) {
            return;
        }

        button.textContent = label;

        // V: Resolve target object
        const targetObj = targetPath
            ? resolvePath(window.game, targetPath)
            : window.game;

        if (targetObj == null) {
            button.disabled = true;
            button.title = `Missing target:  ${targetPath}`;
            return;
        }

        // V: Resolve method
        const fn = targetObj?.[methodName];
        if (typeof fn !== 'function') {
            button.disabled = true;
            button.title = `Missing method: ${targetPath}.${methodName}`;
            return;
        }

        button.onclick = () => fn.call(targetObj);

        if (enabledPath) {
            const enabledObservables = resolvePath(window.game, enabledPath);
            if (
                enabledObservables &&
                typeof enabledObservables.subscribe === 'function'
            ) {
                this.#unsub = enabledObservables.subscribe((v) => {
                    button.disabled = !Boolean(v);
                });
            } else {
                button.title = `Enabled path not observable: ${enabledPath}`;
            }
        }
    }
}

customElements.define('game-button', GameButton);
