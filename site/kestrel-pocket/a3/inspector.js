(() => {
  const views = {
    front: {title:"Compute side", caption:"Through-hole sockets for the removable boards.", alt:"Three-quarter view of the Kestrel Pocket A3 through-hole carrier, showing socket openings, pin labels and mounting holes."},
    rear: {title:"USB side", caption:"Two full-size USB-A host sockets for gamepads, keyboards and mice.", alt:"Three-quarter view of the rear circuit board with the two metal USB-A housings along its left edge and the Pico socket strips."},
    pico: {title:"Pico sockets", caption:"The Pico plugs into two 20-pin female headers.", alt:"Detail of the two open through-hole socket strips for the removable Raspberry Pi Pico."},
    contacts: {title:"Reader socket", caption:"The removable Cyber Disk spring reader plugs into this right-angle socket.", alt:"Detail of the through-hole socket and board cutout for the Cyber Disk spring reader."}
  };
  const legacyViews = {back:"rear",mars:"front",tang:"front"};
  const el = id => document.getElementById(id);
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const viewLinks = [...document.querySelectorAll('[data-view]')];
  let mode = "render";
  let frame;
  function selected() {
    const key = location.hash.slice(1);
    if (Object.hasOwn(views,key)) return key;
    return Object.hasOwn(legacyViews,key) ? legacyViews[key] : "rear";
  }
  function refresh() {
    const key = selected();
    const info = views[key];
    const src = "assets/pcb-" + key + ".webp";
    const orbitURL = "pcb/?embed=1#" + key;
    const interactive = mode === "orbit";
    el("render-link").hidden = interactive;
    el("orbit").hidden = !interactive;
    el("stage").classList.toggle("is-orbit",interactive);
    el("stage").dataset.view = key;
    el("render-link").href = src;
    el("render-link").setAttribute("aria-label","Open the " + info.title.toLowerCase() + " PCB render at full resolution");
    el("render").src = src;
    el("render").alt = info.alt;
    el("view-name").textContent = info.title;
    el("view-caption").textContent = interactive && key === "contacts" ? "The plug-in reader is shown seated. Use the Reader module control to lift it out of view." : info.caption;
    el("ports-link").hidden = interactive || key !== "rear";
    const large = el("large-link");
    large.href = interactive ? "pcb/#" + key : src;
    large.textContent = interactive ? "Full viewer ↗" : "Full resolution ↗";
    large.setAttribute("aria-label",large.textContent.replace(" ↗","") + " in a new tab");
    modeButtons.forEach(button => button.setAttribute("aria-pressed",String(button.dataset.mode === mode)));
    viewLinks.forEach(link => {
      if (link.dataset.view === key) link.setAttribute("aria-current","true");
      else link.removeAttribute("aria-current");
    });
    if (interactive) {
      if (!frame) {
        frame = document.createElement("iframe");
        frame.title = "Interactive 3D model of the routed Kestrel Pocket PCB";
        frame.allowFullscreen = true;
        frame.src = orbitURL;
        el("orbit").append(frame);
      } else if (frame.getAttribute("src") !== orbitURL) frame.src = orbitURL;
    } else if (frame) {
      frame.remove();
      frame = null;
    }
  }
  modeButtons.forEach(button => button.addEventListener("click", () => {
    mode = button.dataset.mode;
    refresh();
  }));
  window.addEventListener("hashchange", refresh);
  refresh();
})();
