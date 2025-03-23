window.onload = function () {
    let instance;

    const savedFlowList = localStorage.getItem('savedFlowList');
    const submitBtn = document.getElementById('submit-btn');
    const submitBtl = document.getElementById('submit-btl');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    let colorToast;

   
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
                containment: "#editor"
            });

            if (blockId.toLowerCase() === "inicio") {
                instance.addEndpoint(newBlock, {
                    anchor: "Bottom",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: true,
                    isTarget: false,
                    maxConnections: 1
                });
            } else if (blockId.toLowerCase() === "fim") {
                instance.addEndpoint(newBlock, {
                    anchor: "Top",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: false,
                    isTarget: true,
                    maxConnections: -1
                });
            } else {
                instance.addEndpoint(newBlock, {
                    anchor: "Top",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: false,
                    isTarget: true
                });
                instance.addEndpoint(newBlock, {
                    anchor: "Bottom",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: true,
                    isTarget: true
                });
            }

          

                instance.bind("connection", function (info) {
           
                    info.connection.setPaintStyle({
                        stroke: "#808080",
                        strokeWidth: 5 
                    });
        
                    
                    info.connection.setConnector(["Flowchart", {
                        gap: 5, 
                        cornerRadius: 0 
                    }]);
        
                  
                    info.connection.addOverlay([
                        "Arrow", { width: 15, length: 15, location: 1 }
                    ]);
        
                 
                    info.connection.revalidate();
                });
            
        }

        newBlock.addEventListener('dblclick', function () {
            if (! savedFlowList) {
                showMenuModal(newBlock);
            }
        });

        return newBlock;
    }

    function showMenuModal(block) {
        const menuModal = document.getElementById('menuModal');
        const editor = document.getElementById('editor');
        const editorRect = editor.getBoundingClientRect();
        const menuRect = block.getBoundingClientRect();

        menuModal.style.display = 'block';
        const menuHeight = menuModal.offsetHeight;
        menuModal.style.display = 'none';

        const offsetX = 10;
        const verticalCenter = menuRect.top + (menuRect.height / 2) - (menuHeight / 2);

        menuModal.style.left = `${menuRect.right - editorRect.left + offsetX}px`;
        menuModal.style.top = `${verticalCenter - editorRect.top}px`;
        menuModal.style.display = 'block';

        const editOption = document.getElementById('editOption');
        const blockType = block.getAttribute('data-type').toLowerCase();

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

        function closeModal(event) {
            if (!menuModal.contains(event.target) && !block.contains(event.target)) {
                menuModal.style.display = 'none';
                document.removeEventListener('click', closeModal);
            }
        }

        setTimeout(() => {
            document.addEventListener('click', closeModal);
        }, 0);
    }
    function showEditModal(block) {
        const modal = document.getElementById('modal');
        const blockRect = block.getBoundingClientRect();

        const blockTypeInput = document.getElementById('blockType');
        const blockExpressionInput = document.getElementById('blockExpression');

        blockTypeInput.value = block.getAttribute('data-type');
        blockExpressionInput.value = block.getAttribute('data-expression') || '';

        modal.style.display = 'block';
        const modalHeight = modal.offsetHeight;
        modal.style.display = 'none';

        const offsetX = 5;
        const verticalCenter = blockRect.top + (blockRect.height / 2) - (modalHeight / 2);

        modal.style.left = `${blockRect.right + offsetX}px`;
        modal.style.top = `${verticalCenter}px`;
        modal.style.position = 'fixed';
        modal.style.display = 'block';

        function closeModal(event) {
            if (!modal.contains(event.target) && event.target !== block) {
                modal.style.display = 'none';
                document.removeEventListener('click', closeModal);
            }
        }

        setTimeout(() => {
            document.addEventListener('click', closeModal);
        }, 0);

        document.getElementById('overlay').onclick = function () {
            modal.style.display = 'none';
            document.removeEventListener('click', closeModal);
        };

        document.getElementById('saveBlock').onclick = function () {
            const newExpression = blockExpressionInput.value.trim();
            if (newExpression !== "") {
                block.setAttribute('data-expression', newExpression);
                block.textContent = newExpression;
            }
            modal.style.display = 'none';
            document.removeEventListener('click', closeModal);
        };
    }

    jsPlumb.ready(function () {
        instance = jsPlumb.getInstance({
            Connector: ["Flowchart"],
            PaintStyle: { stroke: "#808080", strokeWidth: 5 },
            EndpointStyle: { radius: 5, fill: "#808080" },
            Anchor: "AutoDefault",
            ConnectionOverlays: [
                ["Arrow", { width: 15, length: 15, location: 1}]
            ]
        });

        
if (savedFlowList) {
    const { blocks, connections } = JSON.parse(savedFlowList);

    blocks.forEach(block => {
        if (block.id && block.type && block.x && block.y) {
            const x = parseInt(block.x.replace('px', ''));
            const y = parseInt(block.y.replace('px', ''));
            const createdBlock = createBlockInEditor(block.type, x, y, block.expression || "", block.id);

            
            instance.setDraggable(createdBlock, false); 
            createdBlock.style.cursor = 'not-allowed'; 
            createdBlock.contentEditable = 'false'; 
            

             
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
                    connector: ["Flowchart"],
                    paintStyle: { stroke: "#808080", strokeWidth: 5 },
                    detachable: false
                });
            }
        });

        
        instance.setContainer('editor');
        instance.bind("connectionDrag", function () {
            return false; 
        });
        instance.bind("beforeDrop", function () {
            return false; 
        });
        instance.bind("connectionDetached", function () {
            return false; 
        });
        instance.bind("click", function (conn) {
            return false; 
        });
    }, 500);

    
    const paletteBlocks = document.querySelectorAll('#palette .block');
    paletteBlocks.forEach(block => {
        block.setAttribute('draggable', 'false');
        block.style.opacity = '0.5';
        block.style.cursor = 'not-allowed';
    });
} else {
   
    const paletteBlocks = document.querySelectorAll('#palette .block');
    paletteBlocks.forEach(block => {
        block.setAttribute('draggable', 'true');
        block.style.cursor = 'grab';
        block.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('blockId', block.getAttribute('data-type'));
        });
    });
}


const editor = document.getElementById('editor');
editor.addEventListener('dragover', function (e) {
    e.preventDefault();
});
editor.addEventListener('drop', function (e) {
    e.preventDefault();
    if (savedFlowList) return; 
    const blockId = e.dataTransfer.getData('blockId');
    const editorRect = editor.getBoundingClientRect();
    const x = e.clientX - editorRect.left;
    const y = e.clientY - editorRect.top;
    createBlockInEditor(blockId, x, y);
});

    });
    document.getElementById('submit-btn').addEventListener('click', function () {
        console.log("Iniciando a execução...");
    
        submitBtl.style.display = 'none';
    
        if (!instance) {
            showToast("Erro: Instância do jsPlumb não inicializada.", "#f44336");
            console.log("Erro: Instância do jsPlumb não inicializada.");
            return;
        }
    
        const blocksInEditor = document.querySelectorAll('#editor .block');
        if (blocksInEditor.length === 0) {
            showToast("Erro: Não há blocos no editor.", "#f44336");
            console.log("Erro: Não há blocos no editor.");
            return;
        }
    
        const connections = instance.getConnections();
        const blocks = {};
        const executionOrder = [];
        let foundEnd = false;
        let variables = {};
    
        blocksInEditor.forEach(block => {
            blocks[block.id] = {
                type: block.getAttribute('data-type').toLowerCase(),
                expression: block.getAttribute('data-expression'),
                inputs: [],
                output: null
            };
        });
    
        connections.forEach(conn => {
            if (blocks[conn.target.id] && blocks[conn.source.id]) {
                blocks[conn.target.id].inputs.push(conn.source.id);
                blocks[conn.source.id].output = conn.target.id;
            }
        });
    
        let startBlocks = Object.keys(blocks).filter(id => blocks[id].type === 'inicio');
        if (startBlocks.length === 0) {
            showToast("Fluxo inválido: Não possui um bloco de início para iniciar o processo.", "#f44336");
            console.log("Erro: Não possui um bloco de início.");
            return;
        } else if (startBlocks.length > 1) {
            showToast("Fluxo inválido: Só pode haver um bloco de início.", "#f44336");
            console.log("Erro: Só pode haver um bloco de início.");
            return;
        }
    
        let endBlocks = Object.keys(blocks).filter(id => blocks[id].type === 'fim');
        if (endBlocks.length === 0) {
            showToast("Fluxo inválido: Não possui um bloco de fim para terminar o processo.", "#f44336");
            console.log("Erro: Não possui um bloco de fim.");
            return;
        } else if (endBlocks.length > 1) {
            showToast("Fluxo inválido: Só pode haver um bloco de fim.", "#f44336");
            console.log("Erro: Só pode haver um bloco de fim.");
            return;
        }
    
        let disconnectedBlocks = [];
        for (let blockId in blocks) {
            const block = blocks[blockId];
    
            if (block.type === 'inicio') {
                if (block.output === null) {
                    disconnectedBlocks.push(blockId);
                }
            } else if (block.type === 'fim') {
                if (block.inputs.length === 0) {
                    disconnectedBlocks.push(blockId);
                }
            } else {
                if (block.inputs.length === 0 || block.output === null) {
                    disconnectedBlocks.push(blockId);
                }
            }
        }
    
        if (disconnectedBlocks.length > 0) {
            disconnectedBlocks.forEach(blockId => {
                const blockElement = document.getElementById(blockId);
                if (blockElement) {
                    blockElement.classList.add('blink');
                    setTimeout(() => {
                        blockElement.classList.remove('blink');
                    }, 3000);
                }
            });
    
            showToast("Erro: Há bloco(s) desconectados no fluxo. Blocos desconectados", "#f44336");
            console.log("Erro: Blocos desconectados.");
            return;
        }
    
        let visited = new Set();
        let current = startBlocks[0];
        while (current) {
            if (visited.has(current)) {
                showToast("Erro: Ciclo detectado no fluxo!", "#f44336");
                console.log("Erro: Ciclo detectado no fluxo!");
                return;
            }
            if (!blocks[current]) {
                showToast("Erro: Fluxo inválido devido a conexões malformadas.", "#f44336");
                console.log("Erro: Fluxo inválido devido a conexões malformadas.");
                return;
            }
            visited.add(current);
    
            executionOrder.push(current);
            let block = blocks[current];
            console.log(`Processando o bloco: ${current} do tipo ${block.type}`);
    
            if (block.type.startsWith('entrada')) {
             
                let [varName, value] = block.expression.split('=');
                if (!varName || !value) {
                    showToast(`Erro no bloco de entrada: expressão inválida "${block.expression}"`, "#f44336");
                    console.log(`Erro no bloco de entrada: expressão inválida "${block.expression}"`);
                    return;
                }
            
              
                const varNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
                if (!varNameRegex.test(varName.trim())) {
                    showToast(`Erro no bloco de entrada: nome de variável inválido "${varName.trim()}". O nome deve começar com uma letra ou sublinhado e pode conter letras, números e sublinhados.`, "#f44336");
                    console.log(`Erro no bloco de entrada: nome de variável inválido "${varName.trim()}"`);
                    return;
                }
            
              
                if (variables.hasOwnProperty(varName.trim())) {
                    showToast(`Erro no bloco de entrada: a variável "${varName.trim()}" já existe.`, "#f44336");
                    console.log(`Erro no bloco de entrada: a variável "${varName.trim()}" já existe.`);
                    return;
                }
            
            
                variables[varName.trim()] = JSON.parse(value.trim());
                console.log(`Variável de entrada "${varName.trim()}" definida com valor: ${variables[varName.trim()]}`);
            } else if (block.type.startsWith('processo')) {
               
                let [varName, expression] = block.expression.split('=');
                if (!varName || !expression) {
                    showToast(`Erro no bloco de processo: expressão inválida "${block.expression}"`, "#f44336");
                    console.log(`Erro no bloco de processo: expressão inválida "${block.expression}"`);
                    return;
                }
                varName = varName.trim();
            
               
                if (variables.hasOwnProperty(varName)) {
                    showToast(`Erro no bloco de processo: a variável "${varName}" já existe.`, "#f44336");
                    console.log(`Erro no bloco de processo: a variável "${varName}" já existe.`);
                    return;
                }
            
                
                let usedVars = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
                if (!usedVars || usedVars.length === 0) {
                    showToast(`Erro no bloco de processo: a expressão "${expression}" deve usar variáveis existentes.`, "#f44336");
                    console.log(`Erro no bloco de processo: a expressão "${expression}" deve usar variáveis existentes.`);
                    return;
                }
            
                
                for (let v of usedVars) {
                    if (!(v in variables)) {
                        showToast(`Erro: Variável "${v}" usada em "${expression}" não foi definida.`, "#f44336");
                        console.log(`Erro: Variável "${v}" usada em "${expression}" não foi definida.`);
                        return;
                    }
                }
            
                try {
                 
                    if (expression.includes('+')) {
                        console.log("Detectada concatenação de listas.");
                      
                        let parts = expression.split('+').map(part => part.trim());
            
                        let result = [];
                        for (let part of parts) {
                            if (!variables.hasOwnProperty(part)) {
                                showToast(`Erro: Variável "${part}" não foi definida.`, "#f44336");
                                console.log(`Erro: Variável "${part}" não foi definida.`);
                                return;
                            }
                            let lista = variables[part];
                            if (Array.isArray(lista)) {
                                result = result.concat(lista);
                                console.log(`Concatenando a lista: ${part} com valor: ${lista}`);
                            } else {
                                showToast(`Erro: Variável "${part}" não é uma lista.`, "#f44336");
                                console.log(`Erro: Variável "${part}" não é uma lista.`);
                                return;
                            }
                        }
                        
                        variables[varName] = result;
                        console.log(`Resultado da concatenação: ${variables[varName]}`);
                    } else {
                        
                        variables[varName] = new Function('variables', `return ${expression};`)(variables);
                        console.log(`Resultado da expressão: ${variables[varName]}`);
                    }
                } catch (error) {
                    showToast(`Erro na expressão: "${block.expression}"`, "#f44336");
                    console.log(`Erro na expressão: "${block.expression}"`, error);
                    return;
                }
            
            } else if (block.type.startsWith('saida')) {
                let outputVar = block.expression.trim();
                if (!(outputVar in variables)) {
                    showToast(`Erro: variável de saída com a concatenação '${outputVar}' não definida anteriormente.`, "#f44336");
                    console.log(`Erro: variável de saída '${outputVar}' não definida.`);
                    return;
                }
            }
    
            if (block.type === 'fim') {
                foundEnd = true;
                console.log("Bloco 'fim' encontrado. Encerrando o fluxo.");
            }
    
            current = block.output; // Avança para o próximo bloco
        }
    
        if (!foundEnd) {
            showToast("Erro: O fluxo não alcança um bloco 'Fim'. Verifique as conexões.", "#f44336");
            console.log("Erro: O fluxo não alcança um bloco 'Fim'.");
            return;
        }
    
        
        let lastBlock = blocks[executionOrder[executionOrder.length - 2]];
        if (lastBlock && lastBlock.type.startsWith('saida')) {
            let outputVar = lastBlock.expression.trim();
            let expectedOutput = [10, 30, 12, 9, 16, 8]; 
            console.log(`Resultado esperado: ${JSON.stringify(expectedOutput)}`);
            console.log(`Resultado obtido: ${JSON.stringify(variables[outputVar])}`);
    
            if (JSON.stringify(variables[outputVar]) === JSON.stringify(expectedOutput)) {
                showToast("Fluxo correto, parabéns!", "#0d6efd");
    
                const blocksToSave = [];
                const connectionsToSave = [];
                blocksInEditor.forEach(block => {
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
                localStorage.setItem('savedFlowList', JSON.stringify({ blocks: blocksToSave, connections: connectionsToSave }));
                console.log("Fluxo salvo!");
                submitBtn.style.display = 'block';
                submitBtl.style.display = "none"
                location.reload();
            } else {
                showToast("Resultado incorreto!", "#f44336");
                console.log("Resultado incorreto.");
            }
        }
        
    });

    function showToast(message, colorToast) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        toast.style.background = colorToast;
    
        setTimeout(function() {
            toast.classList.remove('show');
        },  30000);
    }
    
    if (savedFlowList) {
        submitBtn.style.display = 'none';
        submitBtl.style.display = 'block';
    } else {
        submitBtn.style.display = 'block';
        submitBtl.style.display = 'none';
    }

    submitBtl.addEventListener('click', function () {
        localStorage.removeItem('savedFlowList');
        location.reload();
    });
};