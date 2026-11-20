(() => {
  const views = {
  "stack": {
    "title": "Exploded assembly",
    "caption": "Front to back, follow the numbered layers in the assembly key below. Rotate the model to see the gaps between boards.",
    "alt": "Exploded view of the front shell, display, buttons, keyboard, optional modules, carrier, service cards and rear controls."
  },
  "controls": {
    "title": "Front controls",
    "caption": "A 2.8-inch, 320 × 240 display sits above the D-pad and X/Y/A/B diamond. Start and Select sit above the keyboard. TYPE / LOCK sits below the controls.",
    "alt": "The assembled handheld from the front, with its screen, D-pad, four labelled game buttons and membrane keyboard."
  },
  "input": {
    "title": "Under the controls",
    "caption": "The caps are lifted to expose ten proposed through-hole switch positions. The keyboard is a separate plug-in assembly.",
    "alt": "Display and keyboard with switch board beneath the lifted D-pad, four action buttons and Start and Select caps."
  },
  "both": {
    "title": "Both compute boards",
    "caption": "The white Mars CM sits on its removable adapter at left. The Tang Nano 20K plugs directly into the two rows at right.",
    "alt": "Installed Mars CM on its adapter and Tang Nano 20K FPGA on the through-hole Kestrel carrier."
  },
  "mars": {
    "title": "Milk-V Mars CM",
    "caption": "The 55 \u00d7 40 mm module mates to two Hirose connectors on the adapter. The adapter plugs into JA1 and JB1.",
    "alt": "Close view of the white Mars CM, memory, processor and socketed green adapter."
  },
  "tang": {
    "title": "Tang Nano 20K",
    "caption": "Two 20-pin rows plug into J2. The Nano carries its own USB-C programming port and HDMI at opposite ends.",
    "alt": "Close view of the Nano FPGA module and both rows of through-hole carrier sockets."
  },
  "bumpers": {
    "title": "Rear paddles",
    "caption": "The two textured paddles sit under the fingers. The orange disk releases sit higher up, alongside the guide rails.",
    "alt": "Rear of the handheld with a half-exposed disk, separate side releases and two ribbed game paddles."
  },
  "service": {
    "title": "Rear service bay",
    "caption": "The USB hub card plugs into J18/J19 beside the full-size USB-A sockets. The removable Pico occupies the lower pair of sockets.",
    "alt": "Open rear service bay with USB hub card and approximate socketed Pico model."
  },
  "front": {
    "title": "Empty compute sockets",
    "caption": "Bare through-hole carrier with the compute boards removed.",
    "alt": "Bare A3 carrier showing the sockets for both compute boards."
  },
  "rear": {
    "title": "USB side",
    "caption": "Two full-size USB-A host sockets for gamepads, keyboards and mice.",
    "alt": "Rear PCB with the two metal USB-A housings."
  },
  "pico": {
    "title": "Pico sockets",
    "caption": "The Pico plugs into two 20-pin female headers.",
    "alt": "Close view of the two Pico socket strips."
  },
  "contacts": {
    "title": "Reader socket",
    "caption": "The removable Cyber Disk spring reader plugs into this right-angle socket.",
    "alt": "Close view of the Cyber Disk reader socket."
  }
};
  const legacyViews = {back:"rear"};
  const el = id => document.getElementById(id);
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const viewLinks = [...document.querySelectorAll('[data-view]')];
  let mode = "render";
  let frame;
  function selected() {
    const key = location.hash.slice(1);
    if (Object.hasOwn(views,key)) return key;
    return Object.hasOwn(legacyViews,key) ? legacyViews[key] : "stack";
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
