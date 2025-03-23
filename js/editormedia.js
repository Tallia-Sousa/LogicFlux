window.onload = function () {
    let instance;

    const savedFlowMedia = localStorage.getItem('savedFlowMedia');
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
        } else if (blockId.toLowerCase() === "decisao") {
            
            const rightEndpoint = instance.addEndpoint(newBlock, {
                anchor: [1, 0.5, 1, 0],
                endpoint: "Dot",
                paintStyle: { fill: "#808080", radius: 5 },
                isSource: true,
                isTarget: false,
                maxConnections: 1
            });
            rightEndpoint.setParameter("label", "Sim");

            
            const leftEndpoint = instance.addEndpoint(newBlock, {
                anchor: [0, 0.5, -1, 0],
                endpoint: "Dot",
                paintStyle: { fill: "#808080", radius: 5 },
                isSource: true,
                isTarget: false,
                maxConnections: 1
            });
            leftEndpoint.setParameter("label", "Não");

            
            instance.addEndpoint(newBlock, {
                anchor: "Top",
                endpoint: "Dot",
                paintStyle: { fill: "#808080", radius: 5 },
                isSource: false,
                isTarget: true,
                maxConnections: 1
            });

            
            const labelYes = document.createElement('div');
            labelYes.classList.add('label-yes');
            labelYes.textContent = "Sim";
            labelYes.style.position = 'absolute';
            editor.appendChild(labelYes);

            const labelNo = document.createElement('div');
            labelNo.classList.add('label-no');
            labelNo.textContent = "Não";
            labelNo.style.position = 'absolute';
            editor.appendChild(labelNo);

           
            const updateLabelPositions = () => {
                const blockRect = newBlock.getBoundingClientRect();
                const editorRect = editor.getBoundingClientRect();

               
                labelYes.style.left = `${blockRect.right - editorRect.left + 10}px`;
                labelYes.style.top = `${blockRect.top - editorRect.top + blockRect.height / 2 - 10}px`;

           
                labelNo.style.left = `${blockRect.left - editorRect.left - 50}px`;
                labelNo.style.top = `${blockRect.top - editorRect.top + blockRect.height / 2 - 10}px`;

               
                instance.repaintEverything();
            };

          
            updateLabelPositions();

            
            new MutationObserver(updateLabelPositions).observe(newBlock, { attributes: true, childList: true, subtree: true });
            newBlock.addEventListener('drag', updateLabelPositions);
            window.addEventListener('resize', updateLabelPositions);

         labelNo.style.display = 'none';
         labelYes.style.display = 'none';

        
instance.bind("connectionDrag", function (info) {
    if (info.sourceId === newBlock.id || info.targetId === newBlock.id) {
        labelYes.style.display = 'block';
        labelNo.style.display = 'block';
    }
});


instance.bind("connection", function (info) {
    
    if (info.sourceId === rightEndpoint.elementId || info.targetId === rightEndpoint.elementId) {
        labelYes.style.display = 'block';
    }
    
    
    if (info.sourceId === leftEndpoint.elementId || info.targetId === leftEndpoint.elementId) {
        labelNo.style.display = 'block';
    }
});


instance.bind("connectionDetached", function (info) {
    const connectionsYes = instance.getConnections({ source: rightEndpoint });
    const connectionsNo = instance.getConnections({ source: leftEndpoint });

  
    if (connectionsYes.length === 0) {
        labelYes.style.display = 'none';
    }

    
    if (connectionsNo.length === 0) {
        labelNo.style.display = 'none';
    }
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
                isTarget: false
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
        if (!savedFlowMedia) {
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
            PaintStyle: {
                stroke: "#808080",
                strokeWidth: 5,
                outlineStroke: "white",
                outlineWidth: 1
            },
            EndpointStyle: {
                radius: 5,
                fill: "#808080"
            },
            Anchor: "AutoDefault",
            ConnectionOverlays: [
                ["Arrow", { width: 15, length: 15, location: 1  }]
            ]
        });

      
        if (savedFlowMedia) {
            const { blocks, connections } = JSON.parse(savedFlowMedia);

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
                      
                        if (sourceBlock.getAttribute('data-type').toLowerCase() === "decisao") {
                           
                            const sourceEndpoints = instance.getEndpoints(sourceBlock);
                            const sourceEndpoint = sourceEndpoints.find(ep => ep.getParameter("label") === conn.label);

                            if (sourceEndpoint) {
                                instance.connect({
                                    source: sourceEndpoint,
                                    target: targetBlock,
                                    anchors: ["Bottom", "Top"],
                                    endpoints: ["Dot", "Dot"],
                                    connector: ["Flowchart"],
                                    paintStyle: { stroke: "#808080", strokeWidth: 5 },
                                    detachable: false
                                });
                            }
                        } else {
                           
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

           
            const editor = document.getElementById('editor');
            editor.addEventListener('dragover', function (e) {
                e.preventDefault();
            });
            editor.addEventListener('drop', function (e) {
                e.preventDefault();
                const blockId = e.dataTransfer.getData('blockId');
                const editorRect = editor.getBoundingClientRect();
                const x = e.clientX - editorRect.left;
                const y = e.clientY - editorRect.top;
                createBlockInEditor(blockId, x, y);
            });
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
    document.getElementById('submit-btn').addEventListener('click', function () {
        submitBtl.style.display = 'none';
        if (!instance) {
            showToast("Erro: Instância do jsPlumb não inicializada.", "#f44336");
            return;
        }
    
        const blocksInEditor = document.querySelectorAll('#editor .block');
        if (blocksInEditor.length === 0) {
            showToast("Erro: Não há blocos no editor.", "#f44336");
            return;
        }
    
        const connections = instance.getConnections();
        const blocks = {};
        const executionOrder = [];
        let foundEnd = false;
        let variables = {}; 
        let notas = []; 
    
        // Mapeia os blocos
        blocksInEditor.forEach(block => {
            blocks[block.id] = {
                type: block.getAttribute('data-type').toLowerCase(),
                expression: block.getAttribute('data-expression'),
                inputs: [],
                outputs: []
            };
        });
    
        // Mapeia as conexões
        connections.forEach(conn => {
            if (blocks[conn.source.id] && blocks[conn.target.id]) {
                blocks[conn.source.id].outputs.push(conn.target.id);
                blocks[conn.target.id].inputs.push(conn.source.id);
            }
        });
    
        // Verifica se há um bloco de início
        let startBlocks = Object.keys(blocks).filter(id => blocks[id].type === 'inicio');
        if (startBlocks.length === 0) {
            showToast("Fluxo inválido: Não possui um bloco de início para iniciar o processo.", "#f44336");
            return;
        } else if (startBlocks.length > 1) {
            showToast("Fluxo inválido: Só pode haver um bloco de início.", "#f44336");
            return;
        }
    
        // Verifica se há um bloco de fim
        let endBlocks = Object.keys(blocks).filter(id => blocks[id].type === 'fim');
        if (endBlocks.length === 0) {
            showToast("Fluxo inválido: Não possui um bloco de fim para terminar o processo.", "#f44336");
            return;
        } else if (endBlocks.length > 1) {
            showToast("Fluxo inválido: Só pode haver um bloco de fim.", "#f44336");
            return;
        }
    
        // Verifica se há blocos desconectados
        let disconnectedBlocks = [];
        for (let blockId in blocks) {
            const block = blocks[blockId];
    
            if (block.type === 'inicio') {
                if (block.outputs.length === 0) {
                    disconnectedBlocks.push(blockId);
                }
            } else if (block.type === 'fim') {
                if (block.inputs.length === 0) {
                    disconnectedBlocks.push(blockId);
                }
            } else {
                if (block.inputs.length === 0 || block.outputs.length === 0) {
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
            return;
        }
    
        // Executa o fluxo
        let visited = new Set();
        let current = startBlocks[0]; 
        while (current) {
            if (visited.has(current)) {
                showToast("Erro: Ciclo detectado no fluxo!", "#f44336");
                return;
            }
            if (!blocks[current]) {
                showToast("Erro: Fluxo inválido devido a conexões malformadas.", "#f44336");
                return;
            }
            visited.add(current);
    
            executionOrder.push(current);
            let block = blocks[current];
    
            // Processa o bloco de entrada
            if (block.type.startsWith('entrada')) {
                let [varName, value] = block.expression.split('=');
                if (!varName || !value) {
                    showToast(`Erro no bloco de entrada: expressão inválida "${block.expression}"`, "#f44336");
                    return;
                }
    
                varName = varName.trim();
                value = value.trim();
    
                if (varName.includes(' ')) {
                    showToast(`Erro no bloco de entrada: nome de variável "${varName}" não pode conter espaços, defina sempre junto ou use "_".`, "#f44336");
                    return;
                }
    
                if (value.includes(',')) {
                    showToast(`Erro no bloco de entrada: valor "${value}" não pode conter vírgulas, use ".".`, "#f44336");
                    return;
                }
    
                if (varName in variables) {
                    showToast(`Erro no bloco de entrada: a variável "${varName}" já foi definida.`, "#f44336");
                    return;
                }
    
                const nota = parseFloat(value);
                if (isNaN(nota)) {
                    showToast(`Erro no bloco de entrada: valor inválido "${value}"`, "#f44336");
                    return;
                }
    
                notas.push(nota); 
                variables[varName] = nota; 
            }
    
            // Processa o bloco de processo
            else if (block.type.startsWith('processo')) {
                let [varName, expression] = block.expression.split('=');
                if (!varName || !expression) {
                    showToast(`Erro no bloco de processo: expressão inválida "${block.expression}"`, "#f44336");
                    return;
                }
    
                varName = varName.trim();
                expression = expression.trim();
    
                if (varName.includes(' ')) {
                    showToast(`Erro no bloco de processo: nome de variável "${varName}" não pode conter espaços.`, "#f44336");
                    return;
                }
    
                if (expression.includes(',')) {
                    showToast(`Erro no bloco de processo: expressão "${expression}" não pode conter vírgulas.`, "#f44336");
                    return;
                }
    
                if (varName in variables) {
                    showToast(`Erro no bloco de processo: a variável "${varName}" já foi definida.`, "#f44336");
                    return;
                }
    
                let usedVars = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
                if (usedVars) {
                    for (let v of usedVars) {
                        if (!(v in variables)) {
                            showToast(`Erro: Variável "${v}" usada em "${expression}" não foi definida.`, "#f44336");
                            return;
                        }
                    }
                }
    
                let evalExpression = expression.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, match => {
                    if (variables[match] !== undefined) {
                        return variables[match];
                    } else {
                        showToast(`Erro: Variável "${match}" usada em "${expression}" não foi definida.`, "#f44336");
                        throw new Error("Variável não definida");
                    }
                });
    
                try {
                    variables[varName] = eval(evalExpression);
                } catch (error) {
                    showToast(`Erro na expressão: "${block.expression}"`, "#f44336");
                    return;
                }
            }
    
            // Processa o bloco de decisão
            else if (block.type.startsWith('decisao')) {
                let condition = block.expression.trim();
    
                if (!condition) {
                    showToast(`Erro no bloco de decisão: expressão inválida "${block.expression}"`, "#f44336");
                    return;
                }
    
                if (condition.includes(',')) {
                    showToast(`Erro no bloco de decisão: condição "${condition}" não pode conter vírgulas, use "."`, "#f44336");
                    return;
                }
    
                let evalCondition = condition.replace(/([a-zA-Z_][a-zA-Z0-9_]*)/g, match => {
                    if (variables[match] !== undefined) {
                        return variables[match];
                    } else {
                        showToast(`Erro: Variável "${match}" usada em "${condition}" não foi definida.`, "#f44336");
                        throw new Error("Variável não definida");
                    }
                });
    
                try {
                    let result = eval(evalCondition);
    
                    const connections = instance.getConnections({ source: current });
                    let nextBlockId = null;
                    let isValid = true;
    
                    connections.forEach(conn => {
                        const sourceEndpoint = conn.endpoints[0];
                        const label = sourceEndpoint.getParameter("label");
                        const targetBlock = blocks[conn.targetId];
    
                        // Normaliza a expressão do bloco de saída para minúsculas
                        const targetExpression = targetBlock.expression.trim().toLowerCase();
    
                        if (result && label === "Sim") {
                            if (targetBlock.type !== 'saída' || targetExpression !== "aprovado") {
                                showToast("Erro: O fluxo 'Sim' deve levar para o bloco 'Aprovado'.", "#dc3545");
                                isValid = false;
                            }
                            nextBlockId = conn.targetId;
                        } else if (!result && label === "Não") {
                            if (targetBlock.type !== 'saída' || targetExpression !== "reprovado") {
                                showToast("Erro: O fluxo 'Não' deve levar para o bloco 'Reprovado'.", "#dc3545");
                                isValid = false;
                            }
                            nextBlockId = conn.targetId;
                        }
                    });
    
                    if (!isValid) {
                        return; 
                    }
    
                    if (!nextBlockId) {
                        showToast(`Erro: O bloco de decisão não está conectado corretamente.`, "#f44336");
                        return;
                    }
    
                    current = nextBlockId; 
                } catch (error) {
                    showToast(`Erro na condição: "${block.expression}"`, "#f44336");
                    return;
                }
            }
    
            // Verifica se chegou ao fim
            if (block.type === 'fim') {
                foundEnd = true;
                break;
            }
            current = block.outputs[0];
        }
    
        if (!foundEnd) {
            showToast("Erro: O fluxo não alcança um bloco 'Fim'. Verifique as conexões.", "#f44336");
            return;
        }
    
        // Verifica se há exatamente duas notas
        if (notas.length !== 2) {
            showToast("Erro: É necessário definir exatamente duas notas nos blocos de entrada.", "#f44336");
            return;
        }
    
        // Calcula a média esperada
        const mediaEsperada = (notas[0] + notas[1]) / 2;
    
        // Verifica se a média foi calculada corretamente
        let mediaCalculada = null;
        for (let varName in variables) {
            if (variables[varName] === mediaEsperada) {
                mediaCalculada = variables[varName];
                break;
            }
        }
    
        if (mediaCalculada === null) {
            showToast("Erro: Nenhuma operação de média foi detectada no fluxo.", "#f44336");
            return;
        }
    
        // Verifica o resultado do usuário
        const aprovadoBlock = Object.keys(blocks).find(id => blocks[id].type === 'saída' && blocks[id].expression.trim().toLowerCase() === "aprovado");
        const reprovadoBlock = Object.keys(blocks).find(id => blocks[id].type === 'saída' && blocks[id].expression.trim().toLowerCase() === "reprovado");
    
        let resultadoUsuario = blocks[aprovadoBlock].outputs.length > 0 ? "Aprovado" : "Reprovado";
    
        if (mediaCalculada >= 6.0 && resultadoUsuario.toLowerCase() === "aprovado") {
            showToast(`Fluxo correto! Resultado: Aprovado`, "#0d6efd");
        
            // Salva o fluxo no localStorage
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
                    const sourceEndpoint = conn.endpoints[0];
                    const label = sourceEndpoint.getParameter("label");
                    connectionsToSave.push({
                        sourceId: conn.sourceId,
                        targetId: conn.targetId,
                        label: label || ""
                    });
                }
            });
        
            localStorage.setItem('savedFlowMedia', JSON.stringify({ blocks: blocksToSave, connections: connectionsToSave }));
        
            submitBtn.style.display = 'none';
            submitBtl.style.display = 'block';
            location.reload();
        } else if (mediaCalculada < 6.0 && resultadoUsuario.toLowerCase() === "reprovado") {
            showToast(`Fluxo correto! Resultado: Reprovado`, "#0d6efd");
        
            // Salva o fluxo no localStorage
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
                    const sourceEndpoint = conn.endpoints[0];
                    const label = sourceEndpoint.getParameter("label");
                    connectionsToSave.push({
                        sourceId: conn.sourceId,
                        targetId: conn.targetId,
                        label: label || ""
                    });
                }
            });
        
            localStorage.setItem('savedFlowMedia', JSON.stringify({ blocks: blocksToSave, connections: connectionsToSave }));
        
            submitBtn.style.display = 'none';
            submitBtl.style.display = 'block';
            location.reload();
        } else {
            showToast(`Erro: A média calculada é ${mediaCalculada}, mas o resultado informado foi "${resultadoUsuario}".`, "#f44336");
        }
    });
    if (savedFlowMedia) {
        submitBtn.style.display = 'none';
        submitBtl.style.display = 'block';
    } else {
        submitBtn.style.display = 'block';
        submitBtl.style.display = 'none';
    }

    submitBtl.addEventListener('click', function () {
        localStorage.removeItem('savedFlowMedia');
        location.reload();
    });
};