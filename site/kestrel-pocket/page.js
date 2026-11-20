"use strict";
const board = document.getElementById("board-view");
const drawing = document.getElementById("drawing");
const threeButton = document.getElementById("view3d");
const drawingButton = document.getElementById("view2d");
const reset = document.getElementById("board-reset");
function selectBoardView(three) {
  board.hidden = !three;
  drawing.hidden = three;
  reset.parentElement.hidden = !three;
  threeButton.setAttribute("aria-pressed", String(three));
  drawingButton.setAttribute("aria-pressed", String(!three));
  if (three) window.dispatchEvent(new Event("resize"));
}
threeButton.addEventListener("click", () => selectBoardView(true));
drawingButton.addEventListener("click", () => selectBoardView(false));
const designs = [
  ["Landscape console", "kestrel-pocket-landscape", "The D-pad and action buttons sit beside the screen. The keyboard stays clear of both thumbs during play."],
  ["Portrait console", "kestrel-pocket-portrait", "A separate row between the LCD and keyboard puts the D-pad, Start, Select and A/B within reach on a narrower body."],
  ["Printable enclosure", "kestrel-handheld-retro-fdm", "A warm beige faceplate meets a charcoal rear tray. Four screws provide access to the electronics."],
  ["Port placement", "kestrel-handheld-concept-v2", "An early edge study groups two USB-C ports, the expansion port and card access. Final openings follow the selected modules."],
  ["Original assembly", "kestrel-handheld-concept", "The first enclosure study shows the display, keyboard, main board and battery stack."]
];
const buttons = [];
for (const [index, [title, file, description]] of designs.entries()) {
  const button = document.createElement("button");
  button.textContent = title;
  button.type = "button";
  button.setAttribute("aria-pressed", String(index === 0));
  buttons.push(button);
  button.addEventListener("click", () => {
    const src = "assets/" + file + ".webp";
    const photo = document.getElementById("hero");
    photo.src = src;
    photo.alt = title + ". " + description;
    document.getElementById("full").href = src;
    document.getElementById("concept-title").textContent = title;
    document.getElementById("description").textContent = description;
    buttons.forEach(other => other.setAttribute("aria-pressed", String(other === button)));
  });
  document.getElementById("options").append(button);
}
function checkViewer() {
  if (board.dataset.failed === "true") {
    selectBoardView(false);
    threeButton.disabled = true;
  }
}
new MutationObserver(checkViewer).observe(board, {attributes: true, attributeFilter: ["data-failed"]});
checkViewer();
