const palette = document.getElementById("palette");
const editor = document.getElementById("editor");
const modal = document.getElementById("modal");
const deleteModal = document.getElementById("deleteModal");
const overlay = document.getElementById("overlay");
const blockForm = document.getElementById("blockForm");
const blockName = document.getElementById("blockName");
const blockExpression = document.getElementById("blockExpression");
const saveBlockButton = document.getElementById("saveBlock");

let currentBlock = null;
let selectedType = null;
let blockToDelete = null;
let clickTimeout = null;

function openModal(block) {
  currentBlock = block;
  if (block.dataset.type === "start" || block.dataset.type === "end") return;
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

function createBlock(type, x, y) {
  const newBlock = document.createElement("div");
  newBlock.classList.add("editor-block", "blue-block"); // Garante a cor azul
  newBlock.dataset.type = type;
  newBlock.style.left = `${x - editor.offsetLeft}px`;
  newBlock.style.top = `${y - editor.offsetTop}px`;

  if (type === "start") {
    newBlock.innerText = "Início";
  } else if (type === "end") {
    newBlock.innerText = "Fim";
  } else {
    newBlock.innerText = `${type} Bloco`;
  }

  newBlock.addEventListener("click", () => handleClick(newBlock));
  newBlock.addEventListener("dblclick", () => showDeleteModal(newBlock));
  makeBlockMovable(newBlock);

  editor.appendChild(newBlock);
}


function handleClick(block) {
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
    showDeleteModal(block);
  } else {
    clickTimeout = setTimeout(() => {
      openModal(block);
      clickTimeout = null;
    }, 300);
  }
}

function showDeleteModal(block) {
  blockToDelete = block;
  deleteModal.style.display = "block";
  overlay.style.display = "block";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
  overlay.style.display = "none";
  blockToDelete = null;
}

document.getElementById("confirmDelete").addEventListener("click", () => {
  if (blockToDelete) blockToDelete.remove();
  closeDeleteModal();
});

document.getElementById("cancelDelete").addEventListener("click", () => {
  closeDeleteModal();
});

function makeBlockMovable(block) {
  let offsetX, offsetY, isDragging = false;

  block.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - block.offsetLeft;
    offsetY = e.clientY - block.offsetTop;
    block.style.position = "absolute";
    block.style.zIndex = "1000";

    function moveBlock(e) {
      if (!isDragging) return;
      block.style.left = `${e.clientX - offsetX}px`;
      block.style.top = `${e.clientY - offsetY}px`;
    }

    function stopDragging() {
      isDragging = false;
      document.removeEventListener("mousemove", moveBlock);
      document.removeEventListener("mouseup", stopDragging);
      block.style.zIndex = "auto";
    }

    document.addEventListener("mousemove", moveBlock);
    document.addEventListener("mouseup", stopDragging);
  });
}

palette.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("block")) {
    e.dataTransfer.setData("text/plain", e.target.dataset.type);
  }
});

editor.addEventListener("dragover", (e) => e.preventDefault());

editor.addEventListener("drop", (e) => {
  e.preventDefault();
  const type = e.dataTransfer.getData("text/plain");
  createBlock(type, e.clientX, e.clientY);
});

palette.addEventListener("touchstart", (e) => {
  if (e.target.classList.contains("block")) {
    selectedType = e.target.dataset.type;
    e.target.style.background = "#ddd";
  }
});

editor.addEventListener("touchend", (e) => {
  if (selectedType) {
    const touch = e.changedTouches[0];
    createBlock(selectedType, touch.clientX, touch.clientY);
    selectedType = null;
  }
});
