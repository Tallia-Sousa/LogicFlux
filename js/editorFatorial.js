window.onload = function () {
    let instance;

    const savedFlowFat = localStorage.getItem('savedFlowFat');
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
                    maxConnections: 1,
                   
                });
            } else if (blockId.toLowerCase() === "fim") {
                
                instance.addEndpoint(newBlock, {
                    anchor: "Top",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: false,
                    isTarget: true,
                    maxConnections: -1,
                    
                });
            } else if (blockId.toLowerCase() === "decisao") {
              
                instance.addEndpoint(newBlock, {
                    anchor: "Top",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: false,
                    isTarget: true,
                    maxConnections: 1,
                    
                });

               
                const bottomEndpoint = instance.addEndpoint(newBlock, {
                    anchor: "Bottom",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: true,
                    isTarget: false,
                    maxConnections: 1,
                   
                });
                bottomEndpoint.setParameter("label", "True");

            
                const leftEndpoint = instance.addEndpoint(newBlock, {
                    anchor: [0, 0.5, -1, 0], 
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: true,
                    isTarget: false,
                    maxConnections: 1,
                   
                });
                leftEndpoint.setParameter("label", "False");

                
                const rightEndpoint = instance.addEndpoint(newBlock, {
                    anchor: [1, 0.5, 1, 0], 
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: true,
                    isTarget: true,
                    maxConnections: 1,
                    
                });
                rightEndpoint.setParameter("label", "Loop");

                
                const labelTrue = document.createElement('div');
                labelTrue.classList.add('label-true');
                labelTrue.textContent = "True";
                labelTrue.style.position = 'absolute';
                editor.appendChild(labelTrue);

                const labelFalse = document.createElement('div');
                labelFalse.classList.add('label-false');
                labelFalse.textContent = "False";
                labelFalse.style.position = 'absolute';
                editor.appendChild(labelFalse);

                const labelLoop = document.createElement('div');
                labelLoop.classList.add('label-loop');
                labelLoop.textContent = "Loop";
                labelLoop.style.position = 'absolute';
                editor.appendChild(labelLoop);

               
                const updateLabelPositions = () => {
                    const blockRect = newBlock.getBoundingClientRect();
                    const editorRect = editor.getBoundingClientRect();

                   
                    labelTrue.style.left = `${blockRect.left - editorRect.left + blockRect.width / 2 - 15}px`;
                    labelTrue.style.top = `${blockRect.bottom - editorRect.top + 10}px`;

                  
                    labelFalse.style.left = `${blockRect.left - editorRect.left - 50}px`;
                    labelFalse.style.top = `${blockRect.top - editorRect.top + blockRect.height / 2 - 10}px`;

                  
                    labelLoop.style.left = `${blockRect.right - editorRect.left + 10}px`;
                    labelLoop.style.top = `${blockRect.top - editorRect.top + blockRect.height / 2 - 10}px`;

                    instance.repaintEverything();
                };

               
                updateLabelPositions();

              
                new MutationObserver(updateLabelPositions).observe(newBlock, { attributes: true, childList: true, subtree: true });
                newBlock.addEventListener('drag', updateLabelPositions);
                window.addEventListener('resize', updateLabelPositions);

               
                labelTrue.style.display = 'none';
                labelFalse.style.display = 'none';
                labelLoop.style.display = 'none';

               
                instance.bind("connectionDrag", function (info) {
                    if (info.sourceId === newBlock.id || info.targetId === newBlock.id) {
                        labelTrue.style.display = 'block';
                        labelFalse.style.display = 'block';
                        labelLoop.style.display = 'block';
                    }
                });

               
                instance.bind("connection", function (info) {
                    if (info.sourceId === bottomEndpoint.elementId || info.targetId === bottomEndpoint.elementId) {
                        labelTrue.style.display = 'block';
                    }
                    if (info.sourceId === leftEndpoint.elementId || info.targetId === leftEndpoint.elementId) {
                        labelFalse.style.display = 'block';
                    }
                    if (info.sourceId === rightEndpoint.elementId || info.targetId === rightEndpoint.elementId) {
                        labelLoop.style.display = 'block';
                    }
                });

                
                instance.bind("connectionDetached", function (info) {
                    const connectionsTrue = instance.getConnections({ source: bottomEndpoint });
                    const connectionsFalse = instance.getConnections({ source: leftEndpoint });
                    const connectionsLoop = instance.getConnections({ source: rightEndpoint });

                    if (connectionsTrue.length === 0) {
                        labelTrue.style.display = 'none';
                    }
                    if (connectionsFalse.length === 0) {
                        labelFalse.style.display = 'none';
                    }
                    if (connectionsLoop.length === 0) {
                        labelLoop.style.display = 'none';
                    }
                });
            } else {
               
                instance.addEndpoint(newBlock, {
                    anchor: "Top",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: false,
                    isTarget: true,
                  
                });
                instance.addEndpoint(newBlock, {
                    anchor: "Bottom",
                    endpoint: "Dot",
                    paintStyle: { fill: "#808080", radius: 5 },
                    isSource: true,  
                    isTarget: false, 
                    
                });
            }

            // Estilo das conexões
            instance.bind("connection", function (info) {
                info.connection.setPaintStyle({
                    stroke: "black",
                    strokeWidth: 2
                });

                info.connection.setConnector("Flowchart");

                // setas
                info.connection.addOverlay([
                    "Arrow", { width: 15, length: 15, location: 1 }
                ]);

                
            });
        }

       
        newBlock.addEventListener('dblclick', function () {
            if (!savedFlowFat) {
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
            Connector: ["Straight"],
            PaintStyle: {
                stroke: "black",
                strokeWidth: 3,
                outlineStroke: "white",
                outlineWidth: 1
            },
            EndpointStyle: {
                radius: 5,
                fill: "gray"
            },
            Anchor: "AutoDefault",
            ConnectionOverlays: [
                ["Arrow", { location: 1, width: 10, length: 10 }]
            ]
        });
    
        
        if (savedFlowFat) {
            const { blocks, connections } = JSON.parse(savedFlowFat);
    
           
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
            connections.forEach(conn => {
                const sourceBlock = document.getElementById(conn.sourceId);
                const targetBlock = document.getElementById(conn.targetId);
            
                if (sourceBlock && targetBlock) {
                    const isDecisionBlock = sourceBlock.getAttribute('data-type').toLowerCase() === "decisao";
                    const isTargetProcessBlock = targetBlock.getAttribute('data-type').toLowerCase() === "processo";
                    const isSourceProcessBlock = sourceBlock.getAttribute('data-type').toLowerCase() === "processo";
    
                    let anchorSource, anchorTarget;
    
                    
                    if (isDecisionBlock) {
                        switch (conn.label) {
                            case "True":
                                anchorSource = "Bottom";
                                anchorTarget = "Top";
                                break;
                            case "False":
                                anchorSource = "Left";
                                anchorTarget = "Top";
                                break;
                            case "Loop":
                                anchorSource = "Right"; 
                                anchorTarget = "Top"; 
                                break;
                            default:
                                anchorSource = "Bottom";
                                anchorTarget = "Top";
                        }
                    } else if (isSourceProcessBlock && isTargetProcessBlock) {
                        
                        anchorSource = "Bottom"; 
                        anchorTarget = "Top"; 
                    } else if (isSourceProcessBlock && targetBlock.getAttribute('data-type').toLowerCase() === "decisao") {
                       
                        anchorSource = "Bottom"; 
                        anchorTarget = "Right"; 
                    } else {
                     
                        anchorSource = "Bottom";
                        anchorTarget = "Top";
                    }
    
                    
                    instance.connect({
                        source: sourceBlock,
                        target: targetBlock,
                        anchors: [anchorSource, anchorTarget],
                        endpoints: ["Dot", "Dot"],
                        connector: ["Straight"],
                        paintStyle: { stroke: "black", strokeWidth: 2 },
                        detachable: false,
                       
                    });
                }
            
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

            // Bloqueio da paleta
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

        setTimeout(function () {
            toast.classList.remove('show');
        }, 9000);
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
        let variables = {}; 

        
        blocksInEditor.forEach(block => {
            blocks[block.id] = {
                type: block.getAttribute('data-type').toLowerCase(),
                expression: block.getAttribute('data-expression'),
                inputs: [],
                outputs: []
            };
        });

        
        connections.forEach(conn => {
            if (blocks[conn.source.id] && blocks[conn.target.id]) {
                blocks[conn.source.id].outputs.push(conn.target.id);
                blocks[conn.target.id].inputs.push(conn.source.id);
            }
        });

        
        let startBlocks = Object.keys(blocks).filter(id => blocks[id].type === 'inicio');
        if (startBlocks.length === 0) {
            showToast("Fluxo inválido: Não possui um bloco de início para iniciar o processo.", "#f44336");
            return;
        } else if (startBlocks.length > 1) {
            showToast("Fluxo inválido: Só pode haver um bloco de início.", "#f44336");
            return;
        }

        let endBlocks = Object.keys(blocks).filter(id => blocks[id].type === 'fim');
        if (endBlocks.length === 0) {
            showToast("Fluxo inválido: Não possui um bloco de fim para terminar o processo.", "#f44336");
            return;
        } else if (endBlocks.length > 1) {
            showToast("Fluxo inválido: Só pode haver um bloco de fim.", "#f44336");
            return;
        }

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

        // executar o fluxo
        const executeFlow = () => {
            let current = startBlocks[0];
            let loopCount = 0;
            let resultVariable = null;

            while (current && loopCount < 1000) {
                const block = blocks[current];

             
                if (block.type === 'inicio') {
                    
                }
             
                else if (block.type === 'entrada') {
                    let [varName, value] = block.expression.split('=');
                    if (!varName || !value) {
                        showToast(`Erro no bloco de entrada: expressão inválida "${block.expression}"`, "#f44336");
                        return null;
                    }
                    varName = varName.trim();
                    value = parseFloat(value.trim());

                    if (isNaN(value)) {
                        showToast(`Erro no bloco de entrada: valor inválido "${value}"`, "#f44336");
                        return null;
                    }

                    variables[varName] = value; 
                }
             
                else if (block.type === 'processo') {
                    let [varName, expression] = block.expression.split('=');
                    if (!varName || !expression) {
                        showToast(`Erro no bloco de processo: expressão inválida "${block.expression}"`, "#f44336");
                        return null;
                    }
                    varName = varName.trim();
                    let usedVars = expression.match(/[a-zA-Z_]+/g);
                    if (usedVars) {
                        for (let v of usedVars) {
                            if (!(v in variables)) {
                                showToast(`Erro: Variável "${v}" usada em "${expression}" não foi definida.`, "#f44336");
                                return null;
                            }
                        }
                    }
                    let evalExpression = expression.replace(/([a-zA-Z_]+)/g, match => `variables['${match}']`);
                    try {
                        variables[varName] = new Function('variables', `return ${evalExpression};`)(variables);
                    } catch (error) {
                        showToast(`Erro na expressão: "${block.expression}"`, "#f44336");
                        return null;
                    }

                    
                    if (expression.includes('*')) { 
                        resultVariable = varName;
                    }
                }
                
                else if (block.type === 'decisao') {
                    let condition = block.expression.trim();
                    let usedVars = condition.match(/[a-zA-Z_]+/g);
                    if (usedVars) {
                        for (let v of usedVars) {
                            if (!(v in variables)) {
                                showToast(`Erro: Variável "${v}" usada em "${condition}" não foi definida.`, "#f44336");
                                return null;
                            }
                        }
                    }
                    let evalCondition = condition.replace(/([a-zA-Z_]+)/g, match => `variables['${match}']`);
                    try {
                        let result = new Function('variables', `return ${evalCondition};`)(variables);

                       
                        const connections = instance.getConnections({ source: current });
                        let nextBlockId = null;
                        connections.forEach(conn => {
                            const sourceEndpoint = conn.endpoints[0];
                            const label = sourceEndpoint.getParameter("label");

                            if (result && label === "True") {
                                
                                nextBlockId = conn.targetId;
                            } else if (!result && label === "False") {
                               
                                nextBlockId = conn.targetId;
                            }
                        });

                        if (!nextBlockId) {
                            showToast(`Erro: O bloco de decisão não está conectado corretamente.`, "#f44336");
                            return null;
                        }

                        current = nextBlockId; 
                        continue;
                    } catch (error) {
                        showToast(`Erro na condição: "${block.expression}"`, "#f44336");
                        return null;
                    }
                }
                
                else if (block.type === 'saida') {
                    let varName = block.expression.trim();
                    if (!varName || !(varName in variables)) {
                        showToast(`Erro: A variável de saída "${varName}" não foi definida.`, "#f44336");
                        return null;
                    }

                    let outputValue = variables[varName];
                    showToast(`Resultado: ${varName} = ${outputValue}`, "#0d6efd");
                }
                
                if (block.type === 'fim') {
                    break;
                }

                current = block.outputs[0]; 
                loopCount++; 
            }

            if (loopCount >= 1000) {
                showToast("Erro: Loop infinito detectado no fluxo.", "#f44336");
                return null;
            }

            return { variables, resultVariable }; 
        };

        
        const { variables: finalVariables, resultVariable } = executeFlow();
        if (!finalVariables || !resultVariable) {
            return;
        }

       
        let fatorialFinal = finalVariables[resultVariable];
        if (fatorialFinal === 120) {
            showToast(`Fluxo correto, parabéns! O fatorial de 5 é ${fatorialFinal}.`, "#0d6efd");

          
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
        let label = ""; 
        conn.endpoints.forEach(endpoint => {
            const endpointLabel = endpoint.getParameter("label");
            if (endpointLabel) {
                label = endpointLabel; 
            }
        });

        
        console.log(`Conexão: ${conn.sourceId} -> ${conn.targetId}, Label: ${label}`);

        connectionsToSave.push({
            sourceId: conn.sourceId,
            targetId: conn.targetId,
            label: label 
        });
    }
});


console.log("Blocos a serem salvos:", blocksToSave);
console.log("Conexões a serem salvas:", connectionsToSave);
localStorage.setItem('savedFlowFat', JSON.stringify({ blocks: blocksToSave, connections: connectionsToSave }));

            submitBtn.style.display = 'none';
            submitBtl.style.display = 'block';
            location.reload();
        } else {
            showToast(`Erro: O fatorial calculado é ${fatorialFinal}, mas o valor esperado para o fatorial de 5 é 120.`, "#f44336");
        }
    });

    if (savedFlowFat) {
        submitBtn.style.display = 'none';
        submitBtl.style.display = 'block';
    } else {
        submitBtn.style.display = 'block';
        submitBtl.style.display = 'none';
    }

    submitBtl.addEventListener('click', function () {
        localStorage.removeItem('savedFlowFat');
        location.reload();
    });
};