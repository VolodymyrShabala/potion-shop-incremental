export class GameButton extends HTMLElement {
  #unsubEnabled = null;

  connectedCallback() {
    this.#render();
    this.#wireEnabled();
  }

  disconnectedCallback() {
    this.#unsubEnabled?.();
    this.#unsubEnabled = null;
  }

  static get obsesrvedAttributes() {
    return ["label", "action", "enabled-key"];
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
      this.#wireEnabled();
    }
  }

  #render() {
    const template = document.getElementById("template-game-button");
    if (template == null) {
      this.innerHTML = `<button></button>`;
    } else {
      this.replaceChildren(template.content.cloneNode(true));
    }

    const button = this.querySelector("button");
    button.textContent = this.getAttribute("label") ?? "Button";

    button.onclick = () => {
      const action = this.getAttribute("action");
      if (action == null) {
        return;
      }

      this.dispatchEvent(
        new CustomEvent("game-action", {
          bubbles: true,
          composed: true,
          detail: { action },
        })
      );
    };
  }

  #wireEnabled() {
    this.disconnectedCallback();

    const button = this.querySelector("button");
    if (button == null) {
      return;
    }

    const enableKey = this.getAttribute("enabled-key");
    if (enableKey == null) {
      button.disabled = false;
      return;
    }

    const game = window.game;
    const observable = game?.[enableKey];
    if (observable == null || typeof observable.subscribe != "function") {
      button.disabled = false;
      return;
    }

    this.#unsubEnabled = observable.subscribe((v) => {
      button.disabled = !Boolean(v);
    });
  }
}

customElements.define("game-button", GameButton);
