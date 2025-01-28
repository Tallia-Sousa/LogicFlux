const palette = document.getElementById("palette");
const editor = document.getElementById("editor");
const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const blockForm = document.getElementById("blockForm");
const blockName = document.getElementById("blockName");
const blockExpression = document.getElementById("blockExpression");
const saveBlockButton = document.getElementById("saveBlock");

let currentBlock = null;

function openModal(block) {
  currentBlock = block;

  // Só abrir o modal para blocos configuráveis
  if (block.dataset.type === "start" || block.dataset.type === "end") {
	return; // Bloqueia para "Início" e "Fim"
  }

  blockName.value = block.dataset.name || "";
  blockExpression.value = block.dataset.expression || "";

  modal.style.display = "block";
  overlay.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  overlay.style.display = "none";
  currentBlock = null;
}

saveBlockButton.addEventListener("click", () => {
  if (currentBlock) {
	currentBlock.dataset.name = blockName.value;
	currentBlock.dataset.expression = blockExpression.value;
	currentBlock.innerText = `${blockName.value}: ${blockExpression.value}`;
  }
  closeModal();
});

overlay.addEventListener("click", closeModal);

palette.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("block")) {
	e.dataTransfer.setData("text/plain", e.target.dataset.type);
  }
});

editor.addEventListener("dragover", (e) => e.preventDefault());

editor.addEventListener("drop", (e) => {
  e.preventDefault();
  const type = e.dataTransfer.getData("text/plain");
  const newBlock = document.createElement("div");
  newBlock.classList.add("editor-block");
  newBlock.dataset.type = type;
  newBlock.style.left = `${e.clientX - editor.offsetLeft}px`;
  newBlock.style.top = `${e.clientY - editor.offsetTop}px`;

  if (type === "start") {
	newBlock.innerText = "Início";
  } else if (type === "end") {
	newBlock.innerText = "Fim";
  } else {
	newBlock.innerText = `${type} Bloco`;
  }

  newBlock.addEventListener("click", () => openModal(newBlock));
  editor.appendChild(newBlock);
});