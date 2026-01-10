export async function loadPartialsIntoApp(appEl) {
  const appHtml = await fetchText("./partials/app.html");
  appEl.innerHTML = appHtml;

  const templatesHTML = await fetchText("./partials/templates.html");
  const holder = document.createElement("div");
  holder.innerHTML = templatesHTML;

  for (const tpl of holder.querySelectorAll("template")) {
    if (document.getElementById(tpl.id) == null) {
      document.body.appendChild(tpl);
    }
  }
}

export async function fetchText(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (res.ok === false) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  return await res.text();
}
