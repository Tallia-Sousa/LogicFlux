window.onload = function () {
    let instance; // Instância global do jsPlumb

    // Captura se existe um fluxo salvo
    const savedFlow = localStorage.getItem('savedFlow');
    const submitBtn = document.getElementById('submit-btn');
    const submitBtl = document.getElementById('submit-btl');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    let colorToast;

    // Função para criar blocos no editor
    function createBlockInEditor(blockId, x, y, expression = "", originalId = null) {
        const newBlock = document.createElement('div');
        newBlock.classList.add('block');
        newBlock.textContent = expression || blockId; 
        newBlock.setAttribute('draggable', 'true');
        newBlock.style.position = 'absolute';
        newBlock.style.left = `${x}px`;
        newBlock.style.top = `${y}px`;
        newBlock.id = originalId || blockId + "_" + Date.now(); 
        newBlock.setAttribute('data-expression', expression);
        newBlock.setAttribute('data-type', blockId);

        const editor = document.getElementById('editor');
        editor.appendChild(newBlock);

        if (instance) {
            
            instance.draggable(newBlock, {
                containment: "#editor" // Impede que o bloco saia da área do editor
            });

            // Configura os endpoints conforme o tipo de bloco
            if (blockId.toLowerCase() === "inicio") {
                instance.addEndpoint(newBlock, {
                    anchor: "Bottom",
                    endpoint: "Dot",
                    isSource: true,
                    isTarget: false,
                    maxConnections: 1
                });
            } else if (blockId.toLowerCase() === "fim") {
                instance.addEndpoint(newBlock, {
                    anchor: "Top",
                    endpoint: "Dot",
                    isSource: false,
                    isTarget: true,
                    maxConnections: 1
                });
            } else {
                instance.addEndpoint(newBlock, {
                    anchor: "Top",
                    endpoint: "Dot",
                    isSource: false,
                    isTarget: true
                });
                instance.addEndpoint(newBlock, {
                    anchor: "Bottom",
                    endpoint: "Dot",
                    isSource: true,
                    isTarget: false
                });
            }
        }

        newBlock.addEventListener('dblclick', function () {
            if (!savedFlow) { // Verifica se não há fluxo salvo
                showMenuModal(newBlock);
            } 
        
        });

        return newBlock; // Retorna o bloco criado
    }

    function showMenuModal(block) {
        const menuModal = document.getElementById('menuModal');
        const menuRect = block.getBoundingClientRect();
    
        // Obtém a altura do menu modal
        menuModal.style.display = 'block'; // Exibe temporariamente para calcular a altura
        const menuHeight = menuModal.offsetHeight;
        menuModal.style.display = 'none'; // Oculta novamente
    
        // Centraliza o menu verticalmente em relação ao bloco
        const offsetX = 10; // Distância do lado direito do bloco
        const verticalCenter = menuRect.top + (menuRect.height / 2) - (menuHeight / 2);
    
        menuModal.style.left = `${menuRect.right + offsetX}px`;
        menuModal.style.top = `${verticalCenter}px`;
        menuModal.style.display = 'block';
    
        const editOption = document.getElementById('editOption');
        const blockType = block.getAttribute('data-type').toLowerCase();
    
        // Se o bloco for do tipo "inicio" ou "fim", oculta a opção de editar
        if (blockType === 'inicio' || blockType === 'fim') {
            editOption.style.display = 'none';
        } else {
            editOption.style.display = 'block';
            editOption.onclick = function () {
                showEditModal(block);
                menuModal.style.display = 'none';
            };
        }
    
        document.getElementById('deleteOption').onclick = function () {
            instance.remove(block);
            block.remove();
            menuModal.style.display = 'none';
        };
    
        // Adiciona o evento para fechar o menu modal ao clicar fora dele
        function closeModal(event) {
            if (!menuModal.contains(event.target)) {
                menuModal.style.display = 'none';
                document.removeEventListener('click', closeModal);
            }
        }
    
        setTimeout(() => {
            document.addEventListener('click', closeModal);
        }, 0);
    }
    
    // Função para exibir o modal de edição do bloco
    function showEditModal(block) {
        const modal = document.getElementById('modal');
        const blockTypeInput = document.getElementById('blockType');
        const blockExpressionInput = document.getElementById('blockExpression');

        blockTypeInput.value = block.getAttribute('data-type');
        blockExpressionInput.value = block.getAttribute('data-expression') || '';

        modal.style.display = 'block';

        document.getElementById('overlay').onclick = function () {
            modal.style.display = 'none';
        };

        document.getElementById('saveBlock').onclick = function () {
            const newExpression = blockExpressionInput.value.trim();
            if (newExpression !== "") {
                block.setAttribute('data-expression', newExpression);
                block.textContent = newExpression;
            }
            modal.style.display = 'none';
        };
    }

    jsPlumb.ready(function () {
        instance = jsPlumb.getInstance({
            Connector: ["Straight"],
            PaintStyle: { stroke: "black", strokeWidth: 2 },
            EndpointStyle: { radius: 5, fill: "gray" },
            Anchor: "AutoDefault",
            ConnectionOverlays: [
                ["Arrow", { location: 1, width: 10, length: 10 }]
            ]
        });

        // Se houver fluxo salvo, restaura os blocos e bloqueia a paleta
// Se houver fluxo salvo, restaura os blocos e bloqueia a paleta
if (savedFlow) {
    const { blocks, connections } = JSON.parse(savedFlow);

    blocks.forEach(block => {
        if (block.id && block.type && block.x && block.y) {
            const x = parseInt(block.x.replace('px', ''));
            const y = parseInt(block.y.replace('px', ''));
            const createdBlock = createBlockInEditor(block.type, x, y, block.expression || "", block.id);

            // Desabilita movimentação e edição para blocos carregados
            instance.setDraggable(createdBlock, false); // Impede que o bloco seja arrastado
            createdBlock.style.cursor = 'not-allowed'; // Muda o cursor para indicar que não é arrastável
            createdBlock.contentEditable = 'false'; // Desativa edição de texto

             // Desabilita a remoção do bloco (se houver funcionalidade 

             
        }
    });

    setTimeout(() => {
        connections.forEach(conn => {
            const sourceBlock = document.getElementById(conn.sourceId);
            const targetBlock = document.getElementById(conn.targetId);
            if (sourceBlock && targetBlock) {
                instance.connect({
                    source: sourceBlock,
                    target: targetBlock,
                    anchors: ["Bottom", "Top"],
                    endpoints: ["Dot", "Dot"],
                    connector: ["Straight"],
                    paintStyle: { stroke: "black", strokeWidth: 2 },
                    detachable: false
                });
            }
        });

        // Desabilita conexões e alterações
        instance.setContainer('editor');
        instance.bind("connectionDrag", function () {
            return false; // Impede o movimento das conexões
        });
        instance.bind("beforeDrop", function () {
            return false; // Impede a criação de novas conexões
        });
        instance.bind("connectionDetached", function () {
            return false; // Impede a remoção de conexões
        });
        instance.bind("click", function (conn) {
            return false; // Impede qualquer manipulação de conexão ao clicar
        });
    }, 500);

    // Bloqueia a paleta: impede o drag e altera o visual
    const paletteBlocks = document.querySelectorAll('#palette .block');
    paletteBlocks.forEach(block => {
        block.setAttribute('draggable', 'false');
        block.style.opacity = '0.5';
        block.style.cursor = 'not-allowed';
    });
} else {
    // Se NÃO houver fluxo salvo, ativa o drag dos blocos da paleta para criação de novos blocos
    const paletteBlocks = document.querySelectorAll('#palette .block');
    paletteBlocks.forEach(block => {
        block.setAttribute('draggable', 'true');
        block.style.cursor = 'grab';
        block.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('blockId', block.getAttribute('data-type'));
        });
    });
}

// Configura o editor para permitir drop (apenas se não houver fluxo salvo)
const editor = document.getElementById('editor');
editor.addEventListener('dragover', function (e) {
    e.preventDefault();
});
editor.addEventListener('drop', function (e) {
    e.preventDefault();
    if (savedFlow) return; // Impede a adição de novos blocos se houver fluxo salvo
    const blockId = e.dataTransfer.getData('blockId');
    const editorRect = editor.getBoundingClientRect();
    const x = e.clientX - editorRect.left;
    const y = e.clientY - editorRect.top;
    createBlockInEditor(blockId, x, y);
});

    });


    document.getElementById('submit-btn').addEventListener('click', function () {

       
        submitBtl.style.display = 'none';
        if (!instance) {
            showToast("Erro: Instância do jsPlumb não inicializada.", " #f44336");
           
            return;
        }
    
        
        const blocksInEditor = document.querySelectorAll('#editor .block');
        if (blocksInEditor.length === 0) {
            showToast("Erro: Não há blocos no editor.", "#f44336");
            // toast.style.backgroundColor = "#f44336";
            return;
        }
    
        const connections = instance.getConnections();
        const blocks = {};
        const executionOrder = [];
        let foundEnd = false;
        let variables = {};
    
        // Mapeia os blocos existentes no editor
        blocksInEditor.forEach(block => {
            blocks[block.id] = {
                type: block.getAttribute('data-type').toLowerCase(),
                expression: block.getAttribute('data-expression'),
                inputs: [],
                output: null
            };
        });
    
        // Mapeia as conexões entre os blocos
        connections.forEach(conn => {
            if (blocks[conn.target.id] && blocks[conn.source.id]) {
                blocks[conn.target.id].inputs.push(conn.source.id);
                blocks[conn.source.id].output = conn.target.id;
            }
        });
    
        // Verifica se existe um bloco "Início"
        let startBlock = Object.keys(blocks).find(id => blocks[id].type === 'inicio');
        if (!startBlock) {
            showToast("Fluxo inválido: Não possui um bloco de inicio para iniciar o processo.",  "#f44336");
            return;
        }

          // Verifica se existe um bloco "Início"
          let endBlock = Object.keys(blocks).find(id => blocks[id].type === 'fim');
          if (!endBlock) {
              showToast("Fluxo inválido: não possui um bloco fim para terminar o processo", "#f44336");
              return;
          }


    
        // Verifica se há blocos desconectados
let disconnectedBlocks = [];
for (let blockId in blocks) {
    const block = blocks[blockId];

    if (block.type === 'inicio') {
        // Bloco "inicio" deve ter pelo menos uma conexão de saída
        if (block.output === null) {
            disconnectedBlocks.push(blockId);
        }
    } else if (block.type === 'fim') {
        // Bloco "fim" deve ter pelo menos uma conexão de entrada
        if (block.inputs.length === 0) {
            disconnectedBlocks.push(blockId);
        }
    } else {
        // Outros blocos devem ter pelo menos uma conexão de entrada e uma conexão de saída
        if (block.inputs.length === 0 || block.output === null) {
            disconnectedBlocks.push(blockId);
        }
    }
}

if (disconnectedBlocks.length > 0) {
    // Aplica o efeito de piscar nos blocos desconectados
    disconnectedBlocks.forEach(blockId => {
        const blockElement = document.getElementById(blockId);
        if (blockElement) {
            blockElement.classList.add('blink'); // Adiciona a classe de piscar
            setTimeout(() => {
                blockElement.classList.remove('blink'); // Remove a classe após 3 segundos
            }, 3000); // 3000ms = 3 segundos
        }
    });

    showToast("Erro: Há bloco(s) desconectados no fluxo. Blocos desconectados", "#f44336");
    return;
}
    
        // Percorre os blocos para validar a execução do fluxo
        let visited = new Set();
        let current = startBlock;
        while (current) {
            if (visited.has(current)) {
                showToast("Erro: Ciclo detectado no fluxo!",  "#f44336");
                return;
            }
            if (!blocks[current]) {
                showToast("Erro: Fluxo inválido devido a conexões malformadas.", "#f44336");
                return;
            }
            visited.add(current);
    
            executionOrder.push(current);
            let block = blocks[current];
    
            // Bloco de Entrada
            if (block.type.startsWith('entrada')) {
                let [varName, value] = block.expression.split('=');
                if (!varName || !value) {
                    showToast(`Erro no bloco de entrada: expressão inválida "${block.expression}"`, "#f44336");

                }
                variables[varName.trim()] = parseFloat(value.trim());
            }
            // Bloco de Processo
            else if (block.type.startsWith('processo')) {
                let [varName, expression] = block.expression.split('=');
                if (!varName || !expression) {
                    showToast(`Erro no bloco de processo: expressão inválida "${block.expression}"`, "#f44336");
                    return;
                }
                varName = varName.trim();
                let usedVars = expression.match(/[a-zA-Z_]+/g);
                if (usedVars) {
                    for (let v of usedVars) {
                        if (!(v in variables)) {
                            showToast(`Erro: Variável "${v}" usada em "${expression}" não foi definida.`, "#f44336");
                            return;
                        }
                    }
                }
                let evalExpression = expression.replace(/([a-zA-Z_]+)/g, match => `variables['${match}']`);
                try {
                    variables[varName] = new Function('variables', `return ${evalExpression};`)(variables);
                } catch (error) {
                    showToast(`Erro na expressão: "${block.expression}"`, "#f44336");
                    return;
                }
            }
            // Bloco de Saída
            else if (block.type.startsWith('saída')) {
                let outputVar = block.expression.trim();
                if (!(outputVar in variables)) {
                    showToast(`Erro: variável de saída '${outputVar}' não definida.`, "#f44336");
                    return;
                }
            }
            // Se o bloco for "Fim", encerra a validação
            if (block.type === 'fim') {
                foundEnd = true;
                break;
            }
            current = block.output;
        }
    
        // Verifica se o fluxo alcançou o bloco de "Fim"
        if (!foundEnd) {
            showToast("Erro: O fluxo não alcança um bloco 'Fim'. Verifique as conexões.", "#f44336");
            return;
        }
    
        // Verifica o resultado final (exemplo: esperado 340)
        let lastBlock = blocks[executionOrder[executionOrder.length - 2]];
        if (lastBlock && lastBlock.type.startsWith('saída')) {
            let outputVar = lastBlock.expression.trim();
            if (variables[outputVar] === 340) {
                showToast("Fluxo correto! Resultado: 340", "#0d6efd");
    
                // Salva o estado do fluxo no localStorage
                const blocksToSave = [];
                const connectionsToSave = [];
                document.querySelectorAll('.block').forEach(block => {
                    if (block.id && block.getAttribute('data-type') && block.style.left && block.style.top) {
                        blocksToSave.push({
                            id: block.id,
                            type: block.getAttribute('data-type'),
                            expression: block.getAttribute('data-expression') || "",
                            x: block.style.left,
                            y: block.style.top
                        });
                    }
                });
                instance.getConnections().forEach(conn => {
                    if (conn.sourceId && conn.targetId) {
                        connectionsToSave.push({
                            sourceId: conn.sourceId,
                            targetId: conn.targetId
                        });
                    }
                });
                localStorage.setItem('savedFlow', JSON.stringify({ blocks: blocksToSave, connections: connectionsToSave }));
    
                submitBtn.style.display ='none'
                submitBtl.style.display = 'block'
                location.reload();
    
            } else {
                showToast(`Resultado incorreto! Esperado: 340, Obtido: ${variables[outputVar]}`, "f44336");
            }
        }
    });

    function showToast(message, colorToast ) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        toast.style.background = colorToast;
        
        setTimeout(function() {
            toast.classList.remove('show');
        }, 9000); 
    }
    
   
   if(savedFlow){
    submitBtn.style.display = 'none';
    submitBtl.style.display = 'block';
    
   }
   else{
    submitBtn.style.display = 'block';
    submitBtl.style.display = 'none';
   }

 submitBtl.addEventListener('click', function(){
    localStorage.removeItem('savedFlow');
        location.reload();
     });

   
};


