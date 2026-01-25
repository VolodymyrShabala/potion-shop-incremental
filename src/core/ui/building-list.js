import { resolvePath } from '../../utility/pathResolver.js';

export class BuildingList extends HTMLElement {
    #unsubs = [];

    connectedCallback() {
        this.#wire();
    }

    disconnectedCallback() {
        this.#unsubs.forEach((u) => u());
        this.#unsubs = [];
    }

    static get observedAttributes() {
        return ['path'];
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.#wire();
        }
    }

    #wire() {
        this.disconnectedCallback();

        const path = this.getAttribute('path');
        if (path == null) {
            return;
        }

        const buildings = resolvePath(window.game, path);
        if (buildings == null || typeof buildings !== 'object') {
            this.textContent = `Missing: ${path}`;
            return;
        }

        for (const building of Object.values(buildings)) {
            if (building.isUnlocked?.subscribe) {
                this.#unsubs.push(
                    building.isUnlocked.subscribe(() => this.#render(path), {
                        emitImmediately: false,
                    })
                );
            }
        }

        this.#render();
    }

    #render() {
        const path = this.getAttribute('path');
        if (path == null) {
            return;
        }

        const buildings = resolvePath(window.game, path);
        if (buildings == null || typeof buildings !== 'object') {
            this.textContent = `Missing: ${path}`;
            return;
        }

        const container = document.createElement('div');
        container.className = 'building-grid';

        for (const [id, building] of Object.entries(buildings)) {
            if (building.isUnlocked.value === false) {
                continue;
            }

            const card = document.createElement('building-card');
            card.setAttribute('path', `${path}.${id}`);
            container.appendChild(card);
        }

        this.replaceChildren(container);
    }
}

customElements.define('building-list', BuildingList);
