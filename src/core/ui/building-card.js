import { resolvePath } from '../../utility/pathResolver.js';

export class BuildingCard extends HTMLElement {
    #unsubs = [];
    #canBuy = false;

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

        const building = resolvePath(window.game, path);
        if (building == null) {
            this.textContent = `Missing: ${path}`;
            return;
        }

        this.className = 'building-card';
        this.innerHTML = `
        <div class="building-btn" tabindex="0" role="button" aria-disabled="false">
            <div class="content">
                <div class="title"></div>
                <div class="sub muted">
                    Owned: <span class="owned"></span> - Cost: <cost-list class="cost" path="${path}"></cost-list>
                </div>
                <div class="count-badge"></div>
                </div>

            <div class="tooltip" role="tooltip">
                <div class="tt-title"></div>
                <div class="tt-line tt-cost"></div>
                <div class="tt-line tt-prod"></div>
                <div class="tt-line tt-unlock"></div>
            </div>
        </div>
        `;

        const button = this.querySelector('.building-btn');
        const titleEl = this.querySelector('.title');
        const ownedEl = this.querySelector('.owned');
        const badgeEl = this.querySelector('.count-badge');

        const ttTitle = this.querySelector('.tt-title');
        const ttCost = this.querySelector('.tt-cost');
        const ttProd = this.querySelector('.tt-prod');
        const ttUnlock = this.querySelector('.tt-unlock');

        titleEl.textContent = building.name ?? 'Building';
        ttTitle.textContent = building.name ?? 'Building';

        ttCost.textContent = `Cost: ${formatCostLine(building)}`;
        ttProd.textContent = `Produces: ${formatProductionLine(building)}`;
        if (building.isUnlocked?.value === false) {
            ttUnlock.textContent = `Unlock: ${formatUnlockLine(b)}`;
            ttUnlock.style.display = '';
        } else {
            ttUnlock.style.display = 'none';
        }

        const active = () => {
            if (this.#canBuy === false) {
                return;
            }

            building.buy?.();
            button.blur();
        };

        button.addEventListener('click', active);
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                active();
            }
        });

        if (building.count?.subscribe) {
            this.#unsubs.push(
                building.count.subscribe((v) => {
                    const value = String(Math.floor(v));
                    ownedEl.textContent = value;
                    badgeEl.textContent = value;
                    ttProd.textContent = `Produces: ${formatProductionLine(building)}`;
                })
            );
        } else {
            ownedEl.textContent = '?';
            badgeEl.textContent = '?';
        }

        if (building.canBuy?.subscribe) {
            this.#unsubs.push(
                building.canBuy.subscribe((can) => {
                    this.#canBuy = !!can;
                    button.setAttribute(
                        'aria-disabled',
                        String(this.#canBuy === false)
                    );
                    button.classList.toggle('disabled', this.#canBuy === false);
                    button.classList.toggle('can-buy', this.#canBuy);
                })
            );
        } else {
            this.#canBuy = true;
        }

        if (building.isUnlocked?.subscribe) {
            this.#unsubs.push(
                building.isUnlocked.subscribe((unlocked) => {
                    if (!unlocked) {
                        ttUnlock.textContent = `Unlock: ${formatUnlockLine(building)}`;
                        ttUnlock.style.display = '';
                    } else {
                        ttUnlock.style.display = 'none';
                    }
                })
            );
        }
    }
}

function formatCostLine(building) {
    const costMap = building.cost ?? {};
    const parts = Object.entries(costMap).map(([currencyID, observable]) => {
        const name = window.game?.currencies?.[currencyID]?.name ?? currencyID;
        const value = observable?.value;
        return `${Math.floor(value ?? 0)} ${name}`;
    });
    return parts.join(' + ') || '—';
}

function formatProductionLine(building) {
    const rates = building.getRatesPerSec?.() ?? {};
    const parts = Object.entries(rates).map(([currencyID, value]) => {
        const name = window.game?.currencies?.[currencyID]?.name ?? currencyID;
        return `${Number(value).toFixed(2)}/s ${name}`;
    });
    return parts.join(', ') || '—';
}

function formatUnlockLine(building) {
    const unlock = building.config?.unlock;
    if (unlock === false) {
        return 'Always';
    }

    const pieces = [];

    const curReq = unlock.currencyAtLeast ?? {};
    for (const [currencyID, min] of Object.entries(curReq)) {
        const name = window.game?.currencies?.[currencyID]?.name ?? currencyID;
        pieces.push(`${min} ${name}`);
    }

    const buildingRequirements = unlock.buildingCountAtLeast ?? {};
    for (const [buildingID, min] of Object.entries(buildingRequirements)) {
        const name = window.game?.buildings?.[buildingID]?.name ?? buildingID;
        pieces.push(`${min} ${name}`);
    }

    return pieces.length ? pieces.join(' & ') : 'Always';
}

customElements.define('building-card', BuildingCard);
