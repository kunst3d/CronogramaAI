// Cronograma IA/ML - JavaScript Interativo
// Baseado no cronograma de estudos com metodologia "Lógica Primeiro"

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas as funcionalidades
    initSmoothScrolling();
    initScheduleTable();
    initScheduleControls();
    initAnimations();
    
    console.log('🧠 Cronograma IA/ML carregado com sucesso!');
});

// ===== NAVEGAÇÃO SUAVE =====
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== TABELA DE HORÁRIOS INTERATIVA =====
function initScheduleTable() {
    const scheduleData = getScheduleData();
    loadScheduleWeek(1); // Carregar semana 1 por padrão
    
    // Adicionar eventos de edição
    const editableCells = document.querySelectorAll('.activity[contenteditable="true"]');
    editableCells.forEach(cell => {
        cell.addEventListener('blur', saveScheduleData);
        cell.addEventListener('keydown', handleCellKeydown);
        cell.addEventListener('input', highlightChanges);
    });
}

// Dados das semanas do cronograma
function getScheduleData() {
    return {
        1: { // Semana 1 - Lógica Pura
            title: "Semana 1 - Lógica de Programação Pura",
            activities: {
                '13-14': ['Fundamentos de Lógica', 'Flowgorithm Prática', 'Algoritmos Visuais', 'Scratch Programming', 'Exercícios Lógica'],
                '14-15': ['Pensamento Algorítmico', 'GeeksforGeeks Logic', 'Divide & Conquer', 'Blockly Games', 'Revisão Semanal'],
                '15-16': ['Prática Fluxograma', 'Problemas Papel', 'Jogos de Lógica', 'CodingGame Puzzles', 'Projeto Pessoal'],
                '16-17': ['☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo'],
                '17-18': ['Revisão & Reflexão', 'Documentação GitHub', 'Community & Dúvidas', 'Planejamento Próxima', 'Avaliação Progresso']
            }
        },
        2: { // Semana 2 - Transição Python
            title: "Semana 2 - Transição Lógica → Python",
            activities: {
                '13-14': ['Python Tutor Demo', 'Sintaxe Básica', 'Variáveis & Tipos', 'Operadores', 'Print & Input'],
                '14-15': ['freeCodeCamp Course', 'Estruturas Condicionais', 'Loops Básicos', 'Real Python Articles', 'Debugging Basics'],
                '15-16': ['Exercícios Práticos', 'Codewars 8kyu', 'Exercism Python', 'Projetos Simples', 'Code Review'],
                '16-17': ['☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo'],
                '17-18': ['Reflexão Diária', 'GitHub Setup', 'Communities', 'Weekly Planning', 'Progress Check']
            }
        },
        3: { // Semana 3 - Python Intermediário
            title: "Semana 3 - Python Intermediário + Lógica Avançada",
            activities: {
                '13-14': ['Estruturas de Dados', 'Lists & Tuples', 'Dictionaries', 'Sets', 'Strings Avançado'],
                '14-15': ['Algoritmos Ordenação', 'Bubble Sort Visual', 'Selection Sort', 'Binary Search', 'VisuAlgo Practice'],
                '15-16': ['Implementação Prática', 'GeeksforGeeks Problems', 'HackerRank Challenges', 'LeetCode Easy', 'Code Optimization'],
                '16-17': ['☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo'],
                '17-18': ['Code Review', 'GitHub Commits', 'Learning Notes', 'Week Planning', 'Skill Assessment']
            }
        },
        4: { // Semana 4 - OOP + Projetos
            title: "Semana 4 - OOP + Aplicação Prática",
            activities: {
                '13-14': ['OOP Conceitos', 'Classes & Objects', 'Métodos', 'Atributos', 'Encapsulamento'],
                '14-15': ['Herança', 'Polimorfismo', 'Real Python OOP', 'Práticas Avançadas', 'Design Patterns'],
                '15-16': ['Sistema Biblioteca', 'Classes: Livro, Usuario', 'CRUD Operations', 'File Handling', 'Testing'],
                '16-17': ['☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo', '☕ Intervalo'],
                '17-18': ['Project Review', 'NumPy Prep', 'Pandas Intro', 'Month 1 Review', 'Month 2 Planning']
            }
        }
    };
}

// Carregar dados de uma semana específica
function loadScheduleWeek(weekNumber) {
    const scheduleData = getScheduleData();
    const weekData = scheduleData[weekNumber];
    
    if (!weekData) return;
    
    const timeSlots = ['13-14', '14-15', '15-16', '16-17', '17-18'];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    timeSlots.forEach((timeSlot, timeIndex) => {
        days.forEach((day, dayIndex) => {
            const cellSelector = `tr:nth-child(${timeIndex + 1}) td:nth-child(${dayIndex + 2})`;
            const cell = document.querySelector(`.schedule-table tbody ${cellSelector}`);
            
            if (cell && weekData.activities[timeSlot]) {
                cell.textContent = weekData.activities[timeSlot][dayIndex];
                
                // Aplicar classes de estilo baseadas no tipo de atividade
                cell.className = cell.className.replace(/\b(logic|theory|practice|break|review)\b/g, '');
                cell.classList.add('activity');
                
                if (timeSlot === '16-17') {
                    cell.classList.add('break');
                } else if (timeSlot === '17-18') {
                    cell.classList.add('review');
                } else if (timeIndex === 0) {
                    cell.classList.add('logic');
                } else if (timeIndex === 1) {
                    cell.classList.add('theory');
                } else {
                    cell.classList.add('practice');
                }
            }
        });
    });
    
    // Salvar no localStorage
    localStorage.setItem('currentWeek', weekNumber);
}

// ===== CONTROLES DA TABELA =====
function initScheduleControls() {
    const weekSelector = document.getElementById('week-selector');
    const saveButton = document.getElementById('save-schedule');
    
    // Carregar semana salva
    const savedWeek = localStorage.getItem('currentWeek') || '1';
    weekSelector.value = savedWeek;
    
    // Event listeners
    weekSelector.addEventListener('change', function() {
        const selectedWeek = parseInt(this.value);
        loadScheduleWeek(selectedWeek);
        showNotification(`📅 Carregada: ${getScheduleData()[selectedWeek].title}`);
    });
    
    saveButton.addEventListener('click', function() {
        saveScheduleData();
        showNotification('💾 Horários salvos com sucesso!');
    });
}

// Salvar dados da tabela no localStorage
function saveScheduleData() {
    const tableData = {};
    const rows = document.querySelectorAll('.schedule-table tbody tr');
    
    rows.forEach((row, rowIndex) => {
        const timeSlot = row.querySelector('.time-slot').textContent.replace(' ', '').replace('h-', '-').replace('h', '');
        const activities = [];
        
        const cells = row.querySelectorAll('.activity[contenteditable="true"]');
        cells.forEach(cell => {
            activities.push(cell.textContent.trim());
        });
        
        tableData[timeSlot] = activities;
    });
    
    const currentWeek = document.getElementById('week-selector').value;
    localStorage.setItem(`schedule-week-${currentWeek}`, JSON.stringify(tableData));
    localStorage.setItem('lastSaved', new Date().toISOString());
}

// Carregar dados salvos da tabela
function loadSavedScheduleData(weekNumber) {
    const savedData = localStorage.getItem(`schedule-week-${weekNumber}`);
    
    if (savedData) {
        const tableData = JSON.parse(savedData);
        
        Object.keys(tableData).forEach(timeSlot => {
            const activities = tableData[timeSlot];
            const timeSlotElement = Array.from(document.querySelectorAll('.time-slot'))
                .find(el => el.textContent.includes(timeSlot.replace('-', 'h - ') + 'h'));
            
            if (timeSlotElement) {
                const row = timeSlotElement.parentElement;
                const editableCells = row.querySelectorAll('.activity[contenteditable="true"]');
                
                editableCells.forEach((cell, index) => {
                    if (activities[index]) {
                        cell.textContent = activities[index];
                    }
                });
            }
        });
        
        return true;
    }
    return false;
}

// ===== FUNCIONALIDADES DE EDIÇÃO =====
function handleCellKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
    }
    
    if (e.key === 'Escape') {
        e.target.blur();
        // Reverter para valor original se necessário
    }
}

function highlightChanges(e) {
    const cell = e.target;
    cell.style.borderLeft = '4px solid #FF5A5F';
    cell.style.background = 'rgba(255, 90, 95, 0.1)';
    
    // Remover destaque após 2 segundos
    setTimeout(() => {
        cell.style.borderLeft = '';
        cell.style.background = '';
    }, 2000);
}

// ===== NOTIFICAÇÕES =====
function showNotification(message, type = 'success') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '24px',
        background: type === 'success' ? '#34C759' : '#FF5A5F',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '1001',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '300px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== ANIMAÇÕES =====
function initAnimations() {
    // Observer para animações em scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.timeline-item, .methodology-card, .book-card, .tip-category');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ===== FUNCIONALIDADES EXTRAS =====

// Exportar horários (CSV)
function exportSchedule() {
    const currentWeek = document.getElementById('week-selector').value;
    const weekData = getScheduleData()[currentWeek];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Horário,Segunda,Terça,Quarta,Quinta,Sexta\n";
    
    const timeSlots = ['13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h'];
    const activities = weekData.activities;
    
    timeSlots.forEach((timeSlot, index) => {
        const timeKey = timeSlot.replace('h', '').replace('-', '-');
        const row = [timeSlot, ...activities[timeKey]];
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cronograma-semana-${currentWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('📄 Cronograma exportado com sucesso!');
}

// Modo escuro (opcional)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    showNotification(isDark ? '🌙 Modo escuro ativado' : '☀️ Modo claro ativado');
}

// Progresso de leitura
function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    Object.assign(progressBar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '0%',
        height: '3px',
        background: '#FF5A5F',
        zIndex: '1002',
        transition: 'width 0.1s ease'
    });
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    });
}

// Inicializar progresso de leitura
document.addEventListener('DOMContentLoaded', initReadingProgress);

// ===== ATALHOS DE TECLADO =====
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S para salvar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveScheduleData();
        showNotification('💾 Horários salvos!');
    }
    
    // Ctrl/Cmd + E para exportar
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportSchedule();
    }
    
    // Ctrl/Cmd + D para modo escuro
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
    }
});

// ===== UTILITÁRIOS =====

// Formatar data
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Verificar suporte a localStorage
function supportsLocalStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Log de inicialização
console.log(`
🧠 CRONOGRAMA IA/ML - METODOLOGIA "LÓGICA PRIMEIRO"
📅 6 meses de estudos estruturados
⏰ 25h/semana (5h/dia, 5 dias/semana)
🎯 Total: 600 horas de aprendizado

Funcionalidades ativas:
✅ Tabela interativa editável
✅ Salvamento automático (localStorage)
✅ 4 semanas pré-programadas
✅ Navegação suave
✅ Animações responsivas
✅ Exportação CSV
✅ Atalhos de teclado
✅ Modo escuro

Atalhos:
Ctrl/Cmd + S: Salvar horários
Ctrl/Cmd + E: Exportar CSV
Ctrl/Cmd + D: Modo escuro

Desenvolvido com ❤️ para acelerar seu aprendizado!
`);

// Expor funções globais para debugging
window.CronogramaIA = {
    loadWeek: loadScheduleWeek,
    saveData: saveScheduleData,
    exportSchedule: exportSchedule,
    toggleDarkMode: toggleDarkMode,
    showNotification: showNotification,
    scheduleData: getScheduleData()
}; 