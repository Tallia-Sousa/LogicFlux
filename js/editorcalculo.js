const palette = document.getElementById("palette");
const editor = document.getElementById("editor");
const menuModal = document.getElementById("menuModal");
const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const blockForm = document.getElementById("blockForm");
const blockName = document.getElementById("blockName");
const blockExpression = document.getElementById("blockExpression");
const saveBlockButton = document.getElementById("saveBlock");

let currentBlock = null;
let blockToDelete = null;





function openModal(block) {
  currentBlock = block;
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
  newBlock.classList.add("editor-block", "blue-block");
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

  newBlock.addEventListener("dblclick", () => showMenuModal(newBlock));
  makeBlockMovable(newBlock);
  editor.appendChild(newBlock);
}

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
          updateConnections();
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

const style = document.createElement("style");
style.innerHTML = `
    .connection-line {
        position: absolute;
        background-color: black;
        height: 2px;
        transform-origin: left;
    }
`;
document.head.appendChild(style);

function showMenuModal(block) {
 
  if (block.innerText === "Início" || block.innerText === "Fim") {
 
    blockToDelete = block;
    menuModal.style.display = "block";
    
    const blockRect = block.getBoundingClientRect();
    menuModal.style.left = `${blockRect.right + 5}px`;  
    menuModal.style.top = `${blockRect.top}px`;  
    document.getElementById("editOption").style.display = "none"; // 
  } else {

    blockToDelete = block;
    menuModal.style.display = "block";

    const blockRect = block.getBoundingClientRect();
    menuModal.style.left = `${blockRect.right + 5}px`; 
    menuModal.style.top = `${blockRect.top}px`;  
   
    document.getElementById("editOption").style.display = "inline"; 
  }
}

function closeMenuModal() {
  menuModal.style.display = "none";
  overlay.style.display = "none";
  blockToDelete = null;
}

document.getElementById("editOption").addEventListener("click", () => {
  if (blockToDelete) {
    openModal(blockToDelete);
  }
  closeMenuModal();
});

document.getElementById("deleteOption").addEventListener("click", () => {
  if (blockToDelete) {
    blockToDelete.remove();
  }
  closeMenuModal();
});

// Permite arrastar blocos apenas da paleta
palette.addEventListener("dragstart", (e) => {
  
  if (e.target.classList.contains("block") && palette.contains(e.target)) {
    e.dataTransfer.setData("text/plain", e.target.dataset.type);
  } else {
    e.preventDefault(); 
  }
});

editor.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("editor-block")) {
    e.preventDefault();
  }
});

editor.addEventListener("dragover", (e) => {
  e.preventDefault(); // Permite o drop apenas no editor
});

editor.addEventListener("drop", (e) => {
  e.preventDefault();
  const type = e.dataTransfer.getData("text/plain");
  createBlock(type, e.clientX, e.clientY);
});

// Fecha o menu modal ao clicar no overlay
overlay.addEventListener("click", closeMenuModal);
