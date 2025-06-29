// PLANEJADOR SEMANAL AVANÇADO - VERSÃO REFATORADA E LIMPA
class AdvancedScheduler {
    constructor() {
        // Estados essenciais
        this.currentWeek = 1;
        this.selectedBlock = null;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeDirection = 'bottom';
        this.dragOffset = { x: 0, y: 0 };
        this.draggedPresetData = null; // Para feedback visual
        
        // Auto-save controlado
        this.autoSaveTimeout = null;
        this.lastSaveTime = 0;
        
        // Horários: 10h-00h30 (30 slots)
        this.timeSlots = [];
        for (let hour = 10; hour <= 23; hour++) {
            this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        this.timeSlots.push("00:00", "00:30");

        // Inicialização com novo sistema de persistência
        this.weekData = this.loadWeekDataFromManager();
        this.ensureDefaultData();
        this.init();
    }

    // ==================== DADOS E CONFIGURAÇÕES ====================
    
    getAllWeeks() {
        return [
            { id: 1, title: "Lógica de Programação Pura", month: 1 },
            { id: 2, title: "Transição Lógica → Python", month: 1 },
            { id: 3, title: "Python Intermediário + Lógica Avançada", month: 1 },
            { id: 4, title: "OOP + Aplicação Prática", month: 1 },
            { id: 5, title: "Álgebra Linear", month: 2 },
            { id: 6, title: "Cálculo", month: 2 },
            { id: 7, title: "Estatística e Probabilidade", month: 2 },
            { id: 8, title: "Visualização de Dados", month: 2 },
            { id: 9, title: "ML Clássico - Parte 1", month: 3 },
            { id: 10, title: "ML Clássico - Parte 2", month: 3 },
            { id: 11, title: "Deep Learning Básico - Parte 1", month: 3 },
            { id: 12, title: "Deep Learning Básico - Parte 2", month: 3 },
            { id: 13, title: "Computer Vision - Parte 1", month: 4 },
            { id: 14, title: "Computer Vision - Parte 2", month: 4 },
            { id: 15, title: "Blender + Python - Parte 1", month: 4 },
            { id: 16, title: "Blender + Python - Parte 2", month: 4 },
            { id: 17, title: "Camera Tracking ML - Parte 1", month: 5 },
            { id: 18, title: "Camera Tracking ML - Parte 2", month: 5 },
            { id: 19, title: "Auto-Retopology - Parte 1", month: 5 },
            { id: 20, title: "Auto-Retopology - Parte 2", month: 5 },
            { id: 21, title: "Reinforcement Learning", month: 6 },
            { id: 22, title: "Unity ML-Agents", month: 6 },
            { id: 23, title: "Isaac Lab - Parte 1", month: 6 },
            { id: 24, title: "Isaac Lab - Parte 2", month: 6 }
        ];
    }

    getPresetBlocks() {
        return {
            logic: [
                { text: "Algoritmos Básicos", duration: 2 }, 
                { text: "Estruturas Condicionais", duration: 2 }, 
                { text: "Loops", duration: 2 },
                { text: "Pseudocódigo", duration: 1 }, 
                { text: "Fluxogramas", duration: 1 }, 
                { text: "Lógica Booleana", duration: 1 }
            ],
            theory: [
                { text: "Leitura Documentação", duration: 3 }, 
                { text: "Vídeo Aulas", duration: 4 }, 
                { text: "Conceitos Fundamentais", duration: 2 }, 
                { text: "Teoria ML", duration: 4 }, 
                { text: "Matemática", duration: 3 },
                { text: "Pesquisa", duration: 2 }
            ],
            practice: [
                { text: "Exercícios Práticos", duration: 2 }, 
                { text: "Projetos", duration: 6 }, 
                { text: "Codificação", duration: 4 }, 
                { text: "Implementação", duration: 4 }, 
                { text: "Debugging", duration: 2 }, 
                { text: "Testes", duration: 2 }
            ],
            break: [
                { text: "Intervalo 15min", duration: 1 }, 
                { text: "Almoço 1h", duration: 2 }, 
                { text: "Pausa 30min", duration: 1 }, 
                { text: "Descanso", duration: 2 }, 
                { text: "Café 10min", duration: 1 }, 
                { text: "Relaxamento", duration: 2 }
            ],
            review: [
                { text: "Revisão Diária", duration: 2 }, 
                { text: "Resumo Semanal", duration: 3 }, 
                { text: "Anotações", duration: 1 }, 
                { text: "Auto-avaliação", duration: 2 }, 
                { text: "Reflexão", duration: 2 }, 
                { text: "Planejamento", duration: 3 }
            ]
        };
    }

        ensureDefaultData() {
        // SÓ criar dados padrão se não existirem dados salvos
        if (Object.keys(this.weekData).length === 0) {
            this.createDefaultSchedule();
            this.forceSave();
        } else {
            console.log("✅ Dados existentes carregados. Mantendo alterações do usuário.");
        }
    }

    // ==================== INICIALIZAÇÃO ====================
    
    init() {
        this.setupEventListeners();
        this.populateWeekSelector();
        this.buildScheduleGrid();
        this.populatePresetBlocks();
        this.setupProgressTracking();
        this.loadCurrentWeek();
        this.setupKeyboardShortcuts();
        console.log("🎉 Scheduler inicializado!");
    }

    setupEventListeners() {
        // Navegação
        document.getElementById("weekSelect").addEventListener("change", (e) => {
            this.currentWeek = parseInt(e.target.value);
            this.loadCurrentWeek();
        });

        document.getElementById("prevWeek").addEventListener("click", () => {
            if (this.currentWeek > 1) {
                this.currentWeek--;
                document.getElementById("weekSelect").value = this.currentWeek;
                this.loadCurrentWeek();
            }
        });

        document.getElementById("nextWeek").addEventListener("click", () => {
            if (this.currentWeek < 24) {
                this.currentWeek++;
                document.getElementById("weekSelect").value = this.currentWeek;
                this.loadCurrentWeek();
            }
        });

        // Salvar
        document.getElementById("saveBtn").addEventListener("click", () => {
            this.forceSave();
        });

        // Reset
        document.getElementById("resetBtn").addEventListener("click", () => {
            this.resetToDefault();
        });

        // Mouse global - SIMPLIFICADO
        document.addEventListener("mousemove", (e) => {
            if (this.isDragging) {
                this.handleDrag(e);
            } else {
                // Limpar feedback se não estiver arrastando
                this.hideDropFeedback();
            }
            if (this.isResizing) this.handleResize(e);
        });

        document.addEventListener("mouseup", (e) => {
            if (this.isDragging) this.handleDragEnd(e);
            if (this.isResizing) this.handleResizeEnd();
        });

        // Desselecionar
        document.addEventListener("click", (e) => {
            if (!e.target.closest('.schedule-block') && !e.target.closest('.preset-block')) {
                this.clearSelection();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                this.forceSave();
            } else if (e.key === "Delete" && this.selectedBlock) {
                this.deleteBlock(this.selectedBlock);
            } else if (e.key === "ArrowLeft" && this.currentWeek > 1) {
                this.currentWeek--;
                document.getElementById("weekSelect").value = this.currentWeek;
                this.loadCurrentWeek();
            } else if (e.key === "ArrowRight" && this.currentWeek < 24) {
                this.currentWeek++;
                document.getElementById("weekSelect").value = this.currentWeek;
                this.loadCurrentWeek();
            }
        });
    }

    // ==================== INTERFACE ====================
    
    populateWeekSelector() {
        const select = document.getElementById("weekSelect");
        const weeks = this.getAllWeeks();
        
        select.innerHTML = "";
        weeks.forEach(week => {
            const option = document.createElement("option");
            option.value = week.id;
            option.textContent = `Semana ${week.id} - ${week.title}`;
            select.appendChild(option);
        });
    }

    buildScheduleGrid() {
        const grid = document.getElementById("scheduleGrid");
        grid.innerHTML = "";

        // Coluna de horários
        const timeColumn = document.createElement("div");
        timeColumn.className = "time-column";
        
        const timeHeader = document.createElement("div");
        timeHeader.className = "time-slot";
        timeHeader.style.height = "40px";
        timeColumn.appendChild(timeHeader);

        this.timeSlots.forEach(time => {
            const slot = document.createElement("div");
            slot.className = "time-slot";
            slot.textContent = time;
            timeColumn.appendChild(slot);
        });
        
        grid.appendChild(timeColumn);

        // Colunas dos dias
        const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
        days.forEach((day, index) => {
            const dayColumn = document.createElement("div");
            dayColumn.className = "day-column";
            dayColumn.dataset.day = index;

            const dayHeader = document.createElement("div");
            dayHeader.className = "day-header";
            dayHeader.textContent = day;
            dayColumn.appendChild(dayHeader);

            const timeGrid = document.createElement("div");
            timeGrid.className = "time-grid";
            timeGrid.style.position = "relative";
            
            this.timeSlots.forEach((time, timeIndex) => {
                const bgSlot = document.createElement("div");
                bgSlot.className = "time-slot-bg";
                bgSlot.dataset.time = timeIndex;
                bgSlot.dataset.day = index;
                
                // Double-click para criar
                bgSlot.addEventListener("dblclick", () => {
                    this.createBlockAtPosition(index, timeIndex);
                });

                // Drag and drop - CORRIGIDO E SIMPLIFICADO
                bgSlot.addEventListener("dragover", (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                    this.showDropFeedback(bgSlot, index, timeIndex);
                });

                bgSlot.addEventListener("dragleave", () => {
                    this.hideDropFeedback();
                });

                bgSlot.addEventListener("drop", (e) => {
                    e.preventDefault();
                    this.hideDropFeedback();
                    this.handleDrop(e, index, timeIndex);
                });
                
                timeGrid.appendChild(bgSlot);
            });

            dayColumn.appendChild(timeGrid);
            grid.appendChild(dayColumn);
        });
    }

    populatePresetBlocks() {
        const container = document.getElementById("presetBlocks");
        const presets = this.getPresetBlocks();
        container.innerHTML = "";

        Object.entries(presets).forEach(([theme, blocks]) => {
            blocks.forEach(blockInfo => {
                const block = document.createElement("div");
                block.className = `preset-block ${theme}`;
                const durationText = blockInfo.duration === 1 ? "30min" : `${blockInfo.duration * 30}min`;
                block.textContent = `${blockInfo.text} (${durationText})`;
                block.draggable = true;
                
                // Drag start - SIMPLIFICADO
                block.addEventListener("dragstart", (e) => {
                    this.draggedPresetData = {
                        theme: theme,
                        text: blockInfo.text,
                        duration: blockInfo.duration
                    };
                    
                    e.dataTransfer.setData("text/plain", JSON.stringify(this.draggedPresetData));
                    e.dataTransfer.effectAllowed = "copy";
                    block.style.opacity = "0.5";
                });

                block.addEventListener("dragend", () => {
                    block.style.opacity = "1";
                    this.draggedPresetData = null;
                    this.hideDropFeedback();
                });

                container.appendChild(block);
            });
        });
    }

    setupProgressTracking() {
        const container = document.getElementById("progressGrid");
        const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
        container.innerHTML = "";

        days.forEach((day, index) => {
            const dayProgress = document.createElement("div");
            dayProgress.className = "day-progress";
            dayProgress.innerHTML = `
                <h4>${day}</h4>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-${index}"></div>
                </div>
                <div class="progress-text" id="progress-text-${index}">0%</div>
            `;
            container.appendChild(dayProgress);
        });
    }

    // ==================== FEEDBACK VISUAL - CLEAN COM LINHAS TRACEJADAS ====================
    
    showDropFeedback(targetSlot, day, timeIndex) {
        this.hideDropFeedback(); // Limpar anterior
        
        if (this.draggedPresetData) {
            let duration = this.draggedPresetData.duration;
            const maxSlots = this.timeSlots.length;
            const dayColumn = targetSlot.closest('.day-column');
            const timeGrid = dayColumn.querySelector('.time-grid');
            
            // AUTO-REDIMENSIONAR: calcular espaço disponível
            const spaceToEnd = maxSlots - timeIndex;
            const spaceToNextBlock = this.getSpaceToNextBlock(day, timeIndex);
            const availableSpace = Math.min(spaceToEnd, spaceToNextBlock);
            
            // Se bloco é maior que espaço disponível, redimensionar
            if (duration > availableSpace) {
                duration = Math.max(1, availableSpace); // Mínimo 1 slot
                console.log(`📏 Auto-redimensionando bloco: ${this.draggedPresetData.duration} → ${duration} slots`);
            }
            
            // Verificar se posição é válida (sem colisão)
            const isValid = this.isPositionValid(day, timeIndex, duration);
            
            // Salvar duração ajustada para uso no drop
            this.adjustedDuration = duration;
            
            // Criar feedback visual clean - UM SÓ BLOCO
            const feedback = document.createElement('div');
            feedback.className = `drop-zone-feedback ${isValid ? '' : 'invalid'}`;
            feedback.style.top = `${timeIndex * 30}px`;
            feedback.style.height = `${duration * 30}px`;
            feedback.id = 'drop-feedback';
            
            // Adicionar texto informativo se foi redimensionado
            if (duration !== this.draggedPresetData.duration) {
                feedback.innerHTML = `<div style="color: #666; font-size: 10px; text-align: center; padding: 2px;">Auto-ajustado: ${duration * 30}min</div>`;
            }
            
            timeGrid.appendChild(feedback);
        }
    }

    // Novo método para calcular espaço até próximo bloco
    getSpaceToNextBlock(day, startTime) {
        const weekBlocks = this.weekData[this.currentWeek]?.blocks || [];
        const dayBlocks = weekBlocks
            .filter(b => b.day === day && b.startTime > startTime)
            .sort((a, b) => a.startTime - b.startTime);
        
        if (dayBlocks.length === 0) {
            return this.timeSlots.length - startTime; // Espaço até o final
        }
        
        return dayBlocks[0].startTime - startTime; // Espaço até próximo bloco
    }

    hideDropFeedback() {
        const existing = document.getElementById('drop-feedback');
        if (existing) {
            existing.remove();
        }
    }

    // Verificar se posição é válida (sem colisão)
    isPositionValid(day, startTime, duration) {
        const weekBlocks = this.weekData[this.currentWeek]?.blocks || [];
        
        for (let block of weekBlocks) {
            if (block.day === day) {
                const blockEnd = block.startTime + block.duration;
                const newBlockEnd = startTime + duration;
                
                // Verificar sobreposição
                if (!(newBlockEnd <= block.startTime || startTime >= blockEnd)) {
                    return false; // Há colisão
                }
            }
        }
        
        return true; // Posição válida
    }

    // ==================== MANIPULAÇÃO DE BLOCOS ====================
    
    createBlockAtPosition(day, timeIndex) {
        const blockData = {
            id: Date.now(),
            day: day,
            startTime: timeIndex,
            duration: 1,
            theme: "logic",
            text: "Novo Bloco",
            completed: false
        };

        this.addBlockToWeek(blockData);
        this.renderSingleBlock(blockData);
    }

    handleDrop(e, day, timeIndex) {
        try {
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            
            // Usar duração ajustada se disponível (do auto-redimensionamento)
            const finalDuration = this.adjustedDuration || data.duration;
            
            // Verificar se posição é válida antes de criar
            if (!this.isPositionValid(day, timeIndex, finalDuration)) {
                console.log("❌ Posição inválida - bloco não criado");
                return;
            }
            
            const blockData = {
                id: Date.now(),
                day: day,
                startTime: timeIndex,
                duration: finalDuration,
                theme: data.theme,
                text: data.text,
                completed: false
            };

            this.addBlockToWeek(blockData);
            this.renderSingleBlock(blockData);
            
            // Limpar duração ajustada
            this.adjustedDuration = null;
            
            if (finalDuration !== data.duration) {
                console.log(`✅ Bloco criado com duração ajustada: ${data.duration * 30}min → ${finalDuration * 30}min`);
            }
        } catch (error) {
            console.error("Erro no drop:", error);
        }
    }

    addBlockToWeek(blockData) {
        if (!this.weekData[this.currentWeek]) {
            this.weekData[this.currentWeek] = { blocks: [] };
        }
        this.weekData[this.currentWeek].blocks.push(blockData);
        this.triggerAutoSave();
    }

    renderSingleBlock(blockData) {
        const dayColumn = document.querySelector(`[data-day="${blockData.day}"] .time-grid`);
        if (!dayColumn) return;

        const block = document.createElement("div");
        block.className = `schedule-block ${blockData.theme}`;
        block.dataset.blockId = blockData.id;
        
        const slotHeight = 30;
        block.style.position = "absolute";
        block.style.top = `${blockData.startTime * slotHeight}px`;
        block.style.height = `${blockData.duration * slotHeight}px`;
        block.style.left = "2px";
        block.style.right = "2px";
        block.style.zIndex = "10";

        block.innerHTML = `
            <div class="block-content">
                <input type="checkbox" class="block-checkbox" ${blockData.completed ? "checked" : ""}>
                <span class="block-text">${blockData.text}</span>
            </div>
            <div class="resize-handle top-handle"></div>
            <div class="resize-handle bottom-handle"></div>
        `;

        this.setupBlockEventListeners(block, blockData);
        dayColumn.appendChild(block);
        this.updateProgressBars();
    }

    renderWeekBlocks() {
        // Limpar blocos existentes
        document.querySelectorAll(".schedule-block").forEach(block => block.remove());

        const weekBlocks = this.weekData[this.currentWeek]?.blocks || [];
        console.log(`📅 Renderizando ${weekBlocks.length} blocos para semana ${this.currentWeek}`);
        
        weekBlocks.forEach(blockData => {
            this.renderSingleBlock(blockData);
        });
    }

    setupBlockEventListeners(blockElement, blockData) {
        const checkbox = blockElement.querySelector(".block-checkbox");
        const topHandle = blockElement.querySelector(".top-handle");
        const bottomHandle = blockElement.querySelector(".bottom-handle");
        
        // Checkbox
        checkbox.addEventListener("change", (e) => {
            e.stopPropagation();
            blockData.completed = e.target.checked;
            this.updateProgressBars();
            this.triggerAutoSave();
        });

        // MOVIMENTO COM THRESHOLD - evitar drag acidental
        let mouseDownTime = 0;
        let mouseDownPos = null;
        let dragStarted = false;

        blockElement.addEventListener("mousedown", (e) => {
            if (e.target === checkbox || e.target.classList.contains('resize-handle')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Selecionar sempre
            this.selectBlock(blockElement, blockData);
            
            // Preparar para possível drag
            mouseDownTime = Date.now();
            mouseDownPos = { x: e.clientX, y: e.clientY };
            dragStarted = false;
            
            // Listener temporário para detectar movimento
            const onMouseMove = (moveEvent) => {
                if (dragStarted) return;
                
                const timeDiff = Date.now() - mouseDownTime;
                const distance = Math.sqrt(
                    Math.pow(moveEvent.clientX - mouseDownPos.x, 2) + 
                    Math.pow(moveEvent.clientY - mouseDownPos.y, 2)
                );
                
                // Iniciar drag se movimento > 5px OU tempo > 200ms
                if (distance > 5 || timeDiff > 200) {
                    dragStarted = true;
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                    this.startDrag(moveEvent, blockElement, blockData);
                }
            };
            
            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };
            
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        // Redimensionamento
        topHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startResize(e, blockData, 'top');
        });

        bottomHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startResize(e, blockData, 'bottom');
        });

        // Edição
        blockElement.addEventListener("dblclick", (e) => {
            if (e.target === checkbox) return;
            e.preventDefault();
            e.stopPropagation();
            this.editBlock(blockData, blockElement);
        });
    }

    // ==================== DRAG & DROP - CORRIGIDO ====================
    
    startDrag(e, blockElement, blockData) {
        this.isDragging = true;
        this.selectedBlock = blockData;
        
        // CAPTURAR DIMENSÕES ORIGINAIS ANTES de adicionar classe dragging
        const rect = blockElement.getBoundingClientRect();
        this.originalDimensions = {
            width: rect.width,
            height: rect.height
        };
        
        blockElement.classList.add("dragging");
        document.body.classList.add('dragging');
        
        // FORÇAR dimensões originais imediatamente
        blockElement.style.width = `${this.originalDimensions.width}px`;
        blockElement.style.height = `${this.originalDimensions.height}px`;
        blockElement.style.minWidth = `${this.originalDimensions.width}px`;
        blockElement.style.maxWidth = `${this.originalDimensions.width}px`;
        
        // Limpar qualquer feedback visual anterior
        this.hideDropFeedback();
        
        // Calcular offset correto baseado no ponto de clique
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // Armazenar posição original para restaurar se necessário
        this.originalPosition = {
            day: blockData.day,
            startTime: blockData.startTime
        };

        console.log("🚀 Drag iniciado:", blockData.text, "Dimensões:", this.originalDimensions);
    }

    handleDrag(e) {
        if (!this.selectedBlock || !this.isDragging) return;

        const blockElement = document.querySelector(`[data-block-id="${this.selectedBlock.id}"]`);
        if (!blockElement) return;

        // MOVIMENTO VISUAL REAL - respeitando ponto de clique inicial
        const currentX = e.clientX - this.dragOffset.x;
        const currentY = e.clientY - this.dragOffset.y;

        // Posicionar o bloco onde o mouse está (respeitando offset inicial)
        blockElement.style.position = "fixed";
        blockElement.style.left = `${currentX}px`;
        blockElement.style.top = `${currentY}px`;
        blockElement.style.zIndex = "9999";
        blockElement.style.pointerEvents = "none";
        
        // GARANTIR que dimensões permanecem fixas durante todo o movimento
        if (this.originalDimensions) {
            blockElement.style.width = `${this.originalDimensions.width}px`;
            blockElement.style.height = `${this.originalDimensions.height}px`;
            blockElement.style.minWidth = `${this.originalDimensions.width}px`;
            blockElement.style.maxWidth = `${this.originalDimensions.width}px`;
        }
        
        // FEEDBACK VISUAL durante movimento - mostrar onde vai cair
        this.showDragFeedback(e);
    }

    // Feedback visual durante movimento de bloco existente
    showDragFeedback(e) {
        // Calcular posição alvo RESPEITANDO o ponto de clique inicial
        const gridRect = document.getElementById("scheduleGrid").getBoundingClientRect();
        const dayWidth = (gridRect.width - 80) / 5;
        
        // Usar posição do mouse MENOS o offset para calcular onde o BLOCO estaria
        const blockX = e.clientX - this.dragOffset.x - gridRect.left - 80;
        const blockY = e.clientY - this.dragOffset.y - gridRect.top - 40;
        
        const targetDay = Math.max(0, Math.min(4, Math.floor((blockX + 75) / dayWidth))); // +75 para centro do bloco
        const targetTimeIndex = Math.max(0, Math.min(this.timeSlots.length - this.selectedBlock.duration, Math.floor(blockY / 30)));

        // Limpar feedback anterior
        this.hideDropFeedback();
        
        // Mostrar feedback na posição alvo
        const targetDayColumn = document.querySelector(`[data-day="${targetDay}"] .time-grid`);
        if (targetDayColumn) {
            // SEMPRE usar duração atual atualizada do bloco
            const currentDuration = this.selectedBlock.duration;
            const isValid = this.isPositionValidForMove(this.selectedBlock.id, targetDay, targetTimeIndex, currentDuration);
            
            const feedback = document.createElement('div');
            feedback.className = `drop-zone-feedback ${isValid ? '' : 'invalid'}`;
            feedback.style.top = `${targetTimeIndex * 30}px`;
            feedback.style.height = `${currentDuration * 30}px`; // Usar duração atual
            feedback.id = 'drop-feedback';
            
            targetDayColumn.appendChild(feedback);
        }
    }

    handleDragEnd(e) {
        if (!this.selectedBlock || !this.isDragging) return;

        const blockElement = document.querySelector(`[data-block-id="${this.selectedBlock.id}"]`);
        if (blockElement) {
            // CALCULAR POSIÇÃO BASEADA NO MOUSE, mais simples e preciso
            const gridRect = document.getElementById("scheduleGrid").getBoundingClientRect();
            const dayWidth = (gridRect.width - 80) / 5;
            
            // Usar posição do mouse RESPEITANDO o ponto de clique inicial
            const blockX = e.clientX - this.dragOffset.x - gridRect.left - 80;
            const blockY = e.clientY - this.dragOffset.y - gridRect.top - 40;
            
            const newDay = Math.max(0, Math.min(4, Math.floor((blockX + 75) / dayWidth))); // +75 para centro do bloco
            const newTimeIndex = Math.max(0, Math.min(this.timeSlots.length - this.selectedBlock.duration, Math.floor(blockY / 30)));

            // Reset visual primeiro
            blockElement.classList.remove("dragging");
            blockElement.style.position = "absolute";
            blockElement.style.left = "2px";
            blockElement.style.right = "2px";
            blockElement.style.width = "auto";
            blockElement.style.height = `${this.selectedBlock.duration * 30}px`; // Manter altura correta
            blockElement.style.zIndex = "10";
            blockElement.style.pointerEvents = "auto";
            
            // LIMPAR propriedades de dimensão forçadas
            blockElement.style.minWidth = "";
            blockElement.style.maxWidth = "";

            // Verificar se nova posição é válida (excluindo o próprio bloco)
            const isValid = this.isPositionValidForMove(this.selectedBlock.id, newDay, newTimeIndex, this.selectedBlock.duration);

            if (isValid) {
                // Posição válida - mover bloco
                console.log("✅ Nova posição válida:", newDay, newTimeIndex);
                
                this.selectedBlock.day = newDay;
                this.selectedBlock.startTime = newTimeIndex;
                
                const newDayColumn = document.querySelector(`[data-day="${newDay}"] .time-grid`);
                if (newDayColumn) {
                    newDayColumn.appendChild(blockElement);
                    blockElement.style.top = `${newTimeIndex * 30}px`;
                }
                
                this.triggerAutoSave();
            } else {
                // Posição inválida - voltar para posição original
                console.log("❌ Posição inválida - voltando para:", this.originalPosition.day, this.originalPosition.startTime);
                
                const originalDayColumn = document.querySelector(`[data-day="${this.originalPosition.day}"] .time-grid`);
                if (originalDayColumn) {
                    originalDayColumn.appendChild(blockElement);
                    blockElement.style.top = `${this.originalPosition.startTime * 30}px`;
                    blockElement.style.height = `${this.selectedBlock.duration * 30}px`;
                    // LIMPAR propriedades de dimensão forçadas
                    blockElement.style.minWidth = "";
                    blockElement.style.maxWidth = "";
                }
            }
        }

        // Limpar feedback visual e dados temporários
        this.hideDropFeedback();
        this.originalDimensions = null; // Limpar para evitar vazamentos
        this.isDragging = false;
        document.body.classList.remove('dragging');
    }

    // Verificar posição válida para movimento (excluindo o próprio bloco)
    isPositionValidForMove(blockId, day, startTime, duration) {
        const weekBlocks = this.weekData[this.currentWeek]?.blocks || [];
        
        for (let block of weekBlocks) {
            // Ignorar o próprio bloco
            if (block.id === blockId) continue;
            
            if (block.day === day) {
                const blockEnd = block.startTime + block.duration;
                const newBlockEnd = startTime + duration;
                
                // Verificar sobreposição
                if (!(newBlockEnd <= block.startTime || startTime >= blockEnd)) {
                    return false; // Há colisão
                }
            }
        }
        
        return true; // Posição válida
    }

    // ==================== REDIMENSIONAMENTO ====================
    
    startResize(e, blockData, direction) {
        this.isResizing = true;
        this.resizeDirection = direction;
        this.selectedBlock = blockData;
        
        const blockElement = document.querySelector(`[data-block-id="${blockData.id}"]`);
        blockElement.classList.add("resizing");
        
        this.resizeStartY = e.clientY;
        this.originalDuration = blockData.duration;
        this.originalStartTime = blockData.startTime;
    }

    handleResize(e) {
        if (!this.selectedBlock || !this.isResizing) return;

        const deltaY = e.clientY - this.resizeStartY;
        const deltaSlots = Math.round(deltaY / 30);
        const maxSlots = this.timeSlots.length; // 29 slots (00h30 é o limite)
        
        const blockElement = document.querySelector(`[data-block-id="${this.selectedBlock.id}"]`);
        if (!blockElement) return;

        if (this.resizeDirection === 'bottom') {
            const newDuration = Math.max(1, this.originalDuration + deltaSlots);
            
            // Verificar se não ultrapassa o limite inferior (00h30)
            if (this.selectedBlock.startTime + newDuration > maxSlots) {
                return; // Não permitir redimensionar além do limite
            }
            
            // Verificar se novo tamanho é válido (sem colisões)
            if (this.isPositionValidForMove(this.selectedBlock.id, this.selectedBlock.day, this.selectedBlock.startTime, newDuration)) {
                this.selectedBlock.duration = newDuration;
                blockElement.style.height = `${newDuration * 30}px`;
            }
        } else if (this.resizeDirection === 'top') {
            const newDuration = Math.max(1, this.originalDuration - deltaSlots);
            const newStartTime = Math.max(0, this.originalStartTime + deltaSlots);
            
            // Verificar se nova posição e tamanho são válidos
            if (newStartTime >= 0 && (newStartTime + newDuration) <= maxSlots && 
                this.isPositionValidForMove(this.selectedBlock.id, this.selectedBlock.day, newStartTime, newDuration)) {
                this.selectedBlock.duration = newDuration;
                this.selectedBlock.startTime = newStartTime;
                
                blockElement.style.height = `${newDuration * 30}px`;
                blockElement.style.top = `${newStartTime * 30}px`;
            }
        }
    }

    handleResizeEnd() {
        if (this.isResizing) {
            const blockElement = document.querySelector(`[data-block-id="${this.selectedBlock.id}"]`);
            if (blockElement) {
                blockElement.classList.remove("resizing");
                
                // GARANTIR que altura visual bate com dados
                blockElement.style.height = `${this.selectedBlock.duration * 30}px`;
                
                console.log("🔄 Redimensionamento finalizado. Nova duração:", this.selectedBlock.duration);
            }
            this.triggerAutoSave();
        }
        this.isResizing = false;
    }

    // ==================== UTILITÁRIOS ====================
    
    selectBlock(blockElement, blockData) {
        document.querySelectorAll(".schedule-block").forEach(b => {
            b.classList.remove("selected");
        });
        
        blockElement.classList.add("selected");
        this.selectedBlock = blockData;
    }

    clearSelection() {
        document.querySelectorAll(".schedule-block").forEach(b => {
            b.classList.remove("selected");
        });
        this.selectedBlock = null;
    }

    editBlock(blockData, blockElement) {
        const newText = prompt("Editar bloco:", blockData.text);
        if (newText !== null && newText.trim() !== "") {
            blockData.text = newText.trim();
            
            const textElement = blockElement.querySelector(".block-text");
            if (textElement) {
                textElement.textContent = blockData.text;
            }
            
            this.triggerAutoSave();
        }
    }

    deleteBlock(blockData) {
        const weekBlocks = this.weekData[this.currentWeek]?.blocks || [];
        const index = weekBlocks.findIndex(b => b.id === blockData.id);
        if (index > -1) {
            weekBlocks.splice(index, 1);
            
            const blockElement = document.querySelector(`[data-block-id="${blockData.id}"]`);
            if (blockElement) {
                blockElement.remove();
            }
            
            this.updateProgressBars();
            this.triggerAutoSave();
        }
        this.selectedBlock = null;
    }

    updateProgressBars() {
        const weekBlocks = this.weekData[this.currentWeek]?.blocks || [];
        
        for (let day = 0; day < 5; day++) {
            const dayBlocks = weekBlocks.filter(b => b.day === day);
            const completedBlocks = dayBlocks.filter(b => b.completed);
            const percentage = dayBlocks.length > 0 ? (completedBlocks.length / dayBlocks.length) * 100 : 0;
            
            const progressFill = document.getElementById(`progress-${day}`);
            const progressText = document.getElementById(`progress-text-${day}`);
            
            if (progressFill && progressText) {
                progressFill.style.width = `${percentage}%`;
                progressText.textContent = `${Math.round(percentage)}%`;
            }
        }
    }

    loadCurrentWeek() {
        const weeks = this.getAllWeeks();
        const currentWeekData = weeks.find(w => w.id === this.currentWeek);
        
        if (currentWeekData) {
            document.getElementById("weekInfo").textContent = 
                `Semana ${currentWeekData.id} - ${currentWeekData.title}`;
        }

        this.renderWeekBlocks();
        this.updateNavigationButtons();
        this.updateProgressBars();
    }

    updateNavigationButtons() {
        document.getElementById("prevWeek").disabled = this.currentWeek <= 1;
        document.getElementById("nextWeek").disabled = this.currentWeek >= 24;
    }

    // ==================== PERSISTÊNCIA COM DATAMANAGER ====================
    
    triggerAutoSave() {
        if (window.dataManager) {
            window.dataManager.saveData(this.weekData);
        } else {
            console.warn("⚠️ DataManager não disponível");
        }
    }

    forceSave() {
        if (window.dataManager) {
            return window.dataManager.forceSave(this.weekData);
        } else {
            console.warn("⚠️ DataManager não disponível");
            return false;
        }
    }

    loadWeekDataFromManager() {
        if (window.dataManager) {
            return window.dataManager.loadData();
        } else {
            console.warn("⚠️ DataManager não disponível - usando dados vazios");
            return {};
        }
    }

    exportSchedule() {
        if (window.dataManager) {
            window.dataManager.exportData();
        } else {
            console.warn("⚠️ DataManager não disponível");
        }
    }

    // Método para resetar todos os dados (quando necessário)
    resetToDefault() {
        if (confirm("⚠️ Isso irá APAGAR todos os seus dados e criar um cronograma padrão. Tem certeza?")) {
            // Limpar dados salvos
            if (window.dataManager) {
                window.dataManager.clearAllData();
            }
            
            // Recriar dados padrão
            this.weekData = {};
            this.createDefaultSchedule();
            this.forceSave();
            
            // Recarregar interface
            this.loadCurrentWeek();
            
            console.log("🔄 Dados resetados para padrão");
        }
    }

    createDefaultSchedule() {
        console.log("📝 Criando cronograma padrão...");
        
        // Semana 1 - Detalhada
        this.weekData[1] = {
            blocks: [
                { id: 1001, day: 0, startTime: 0, duration: 4, theme: "logic", text: "Fundamentos de Lógica", completed: false },
                { id: 1002, day: 0, startTime: 4, duration: 4, theme: "theory", text: "Pensamento Algorítmico", completed: false },
                { id: 1003, day: 0, startTime: 10, duration: 4, theme: "practice", text: "Prática Fluxograma", completed: false },
                { id: 1004, day: 0, startTime: 16, duration: 2, theme: "break", text: "☕ Intervalo", completed: false },
                { id: 1005, day: 0, startTime: 20, duration: 4, theme: "review", text: "Revisão & Reflexão", completed: false },
                
                { id: 1006, day: 1, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                { id: 1007, day: 1, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                { id: 1008, day: 1, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false },
                
                { id: 1009, day: 2, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                { id: 1010, day: 2, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                { id: 1011, day: 2, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false },
                
                { id: 1012, day: 3, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                { id: 1013, day: 3, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                { id: 1014, day: 3, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false },
                
                { id: 1015, day: 4, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                { id: 1016, day: 4, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                { id: 1017, day: 4, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false }
            ]
        };

        // Outras semanas - Modelo básico
        for (let week = 2; week <= 24; week++) {
            this.weekData[week] = {
                blocks: [
                    { id: week * 1000 + 1, day: 0, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                    { id: week * 1000 + 2, day: 0, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                    { id: week * 1000 + 3, day: 0, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false },
                    
                    { id: week * 1000 + 4, day: 1, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                    { id: week * 1000 + 5, day: 1, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                    { id: week * 1000 + 6, day: 1, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false },
                    
                    { id: week * 1000 + 7, day: 2, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                    { id: week * 1000 + 8, day: 2, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                    { id: week * 1000 + 9, day: 2, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false },
                    
                    { id: week * 1000 + 10, day: 3, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                    { id: week * 1000 + 11, day: 3, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                    { id: week * 1000 + 12, day: 3, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false },
                    
                    { id: week * 1000 + 13, day: 4, startTime: 0, duration: 6, theme: "theory", text: "Estudo Teórico", completed: false },
                    { id: week * 1000 + 14, day: 4, startTime: 8, duration: 6, theme: "practice", text: "Prática", completed: false },
                    { id: week * 1000 + 15, day: 4, startTime: 16, duration: 4, theme: "review", text: "Revisão", completed: false }
                ]
            };
        }
    }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    try {
        window.scheduler = new AdvancedScheduler();
    } catch (error) {
        console.error("💥 Erro na inicialização:", error);
    }
});

