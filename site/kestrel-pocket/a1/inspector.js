const parts = {
  pico: {
    side: "back",
    title: "Socketed Pico H",
    description: "The Raspberry Pi Pico H plugs into the two highlighted 20-pin female headers. Power down and remove the lower rear service cover to lift it out.",
    facts: [["Base hardware", "Pico H and both socket strips included"], ["Function", "Scans the controls and switches the screen and disk between modules."]],
    alt: "Rear of Carrier A1. Two parallel Pico H socket strips sit near the lower edge."
  },
  contacts: {
    side: "back",
    title: "Cyber Disk contacts",
    description: "Seven metal leaf springs solder directly to the rear PCB tongue. The disk slides down the guide rails with its exposed contact pads first.",
    facts: [["Contact spacing", "6 mm between spring centers"], ["Reader", "Harwin S7131-45R springs carry power and data. The seventh contact is reserved."]],
    alt: "Rear of Carrier A1. A single vertical row of seven springs runs down the narrow disk tongue."
  },
  mars: {
    side: "front",
    title: "Milk-V Mars CM",
    description: "The optional RISC-V compute module mates with the two fine-pitch connectors on the left. Four mounting holes surround the module footprint.",
    facts: [["Module", "Customer-supplied Milk-V Mars CM"], ["Software", "Runs RV64 Kestrel BASIC or boots Linux. The reference configuration uses 4 GB of memory."]],
    alt: "Front of Carrier A1. The Milk-V module attaches to two white connectors on the left half."
  },
  tang: {
    side: "front",
    title: "Tang Nano 20K",
    description: "The optional Sipeed FPGA board plugs into the two parallel headers on the right. It can run the FPGA launcher with the Mars socket empty.",
    facts: [["Module", "Customer-supplied Sipeed Tang Nano 20K"], ["Software", "The recovery image includes the launcher and the Glide game."]],
    alt: "Front of Carrier A1. Two vertical female header strips on the right accept the Tang Nano 20K."
  }
};
const buttons = [...document.querySelectorAll("[data-part]")];
const sides = [...document.querySelectorAll("[data-side]")];
const preferred = {back:"pico", front:"mars"};
const image = document.getElementById("board-image");
const renderLink = document.getElementById("original-render");
const partModel = document.getElementById("part-model");
const factSlots = ["one", "two"].map(key => [
  document.getElementById("spec-" + key + "-label"), document.getElementById("spec-" + key)
]);

function showPart(key) {
  const part = parts[key];
  const src = "assets/Kestrel-A1-PCB-" + part.side + ".png";
  preferred[part.side] = key;
  sides.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.side === part.side)));
  buttons.forEach(button => {
    button.hidden = parts[button.dataset.part].side !== part.side;
    button.setAttribute("aria-pressed", String(button.dataset.part === key));
  });
  image.src = src;
  image.alt = part.alt;
  renderLink.href = src;
  document.getElementById("outlines").className = "outlines " + key;
  document.getElementById("part-title").textContent = part.title;
  document.getElementById("part-description").textContent = part.description;
  part.facts.forEach(([label, value], index) => {
    factSlots[index][0].textContent = label;
    factSlots[index][1].textContent = value;
  });
  partModel.href = key === "pico" ? "./assembly/#pico" : "./assembly/";
  partModel.textContent = key === "pico" ? "Locate Pico H in 3D" : "Rotate the 3D assembly";
}

sides.forEach(button => button.addEventListener("click", () => showPart(preferred[button.dataset.side])));
buttons.forEach(button => button.addEventListener("click", () => showPart(button.dataset.part)));
function applyFragment() {
  const key = location.hash.slice(1);
  if (Object.hasOwn(parts, key)) showPart(key);
}
applyFragment();
window.addEventListener("hashchange", applyFragment);
