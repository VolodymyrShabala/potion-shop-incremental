export class TabView extends HTMLElement {
  #active = 0;

  static get observedAttributes() {
    return ["ready"];
  }

  connectedCallback() {
    if (this.hasAttribute("ready")) {
      this.#render();
    }
  }

  attributeChangedCallback(name) {
    if (name === "ready" && this.hasAttribute("ready")) {
      this.#render();
    }
  }

  #render() {
    const template = document.getElementById("template-tab-view");
    if (template) {
      const content = template.content.cloneNode(true);
      // const container = content.querySelector("[data-tab-container]");
      const panels = Array.from(this.querySelectorAll(":scope > section"));

      this.replaceChildren(content);

      const buttonsElement = this.querySelector("[data-tab-buttons]");
      const panelsElement = this.querySelector("[data-tab-panels]");

      if (buttonsElement == null || panelsElement == null) {
        console.error(
          "TabView: missing tab buttons/panels container in template"
        );
        return;
      }

      panels.forEach((panel, i) => {
        const name = panel.getAttribute("data-tab") ?? `Tab ${i + 1}`;
        const button = document.createElement("button");
        button.textContent = name;
        button.onclick = () => this.#setActive(i);
        buttonsElement.appendChild(button);

        panel.classList.add("tab-panel");
        panelsElement.appendChild(panel);
      });

      const fromHash = this.#indexFromHash(panels);
      this.#setActive(fromHash ?? 0);
      return;
    }

    const panels = Array.from(this.querySelectorAll(":scope > section"));
    panels.forEach((p, i) => (p.hidden = i !== 0));
  }

  // TODO V: What does it do?
  #setActive(i) {
    this.#active = i;
    const buttons = Array.from(
      this.querySelectorAll("[data-tab-buttons] button")
    );
    const panels = Array.from(
      this.querySelectorAll("[data-tab-panels] > section")
    );

    buttons.forEach((button, index) =>
      button.classList.toggle("active", index === i)
    );
    panels.forEach((panel, index) => (panel.hidden = index !== i));

    // V: Put active panel i hash for refresh.friendly navigation
    const activeName = buttons[i]?.textContent?.trim();
    if (activeName) {
      const slug = activeName.toLocaleLowerCase().replace(/\s+/g, "-");
      history.replaceState(null, "", `#tab=${encodeURIComponent(slug)}`);
    }
  }

  #indexFromHash(panels) {
    const match = location.hash.match(/tab=([^&]+)/);
    if (match == null) {
      return null;
    }

    const wanted = decodeURIComponent(match[1]);

    const index = panels.findIndex((panel) => {
      const name = (panel.getAttribute("data-tab") ?? "")
        .toLocaleLowerCase()
        .replace(/\s+/g, "-");
      return name === wanted;
    });

    return index >= 0 ? index : null;
  }
}

customElements.define("tab-view", TabView);
