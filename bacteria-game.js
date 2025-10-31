// ==========================================
// BACTERIA EVOLUTION SIMULATOR
// Sistema avançado de IA e evolução genética
// ==========================================

// Configuração do canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Ajustar tamanho do canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 700;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==========================================
// SISTEMA DE DNA E GENÉTICA
// ==========================================

class DNA {
    constructor(parent1DNA = null, parent2DNA = null) {
        if (parent1DNA && parent2DNA) {
            // Reprodução sexual - combina genes dos pais
            this.genes = this.crossover(parent1DNA.genes, parent2DNA.genes);
        } else if (parent1DNA) {
            // Clonagem com mutação
            this.genes = { ...parent1DNA.genes };
        } else {
            // DNA inicial aleatório
            this.genes = {
                speed: Math.random() * 3 + 1,           // Velocidade (1-4)
                size: Math.random() * 8 + 6,            // Tamanho (6-14)
                visionRange: Math.random() * 150 + 100, // Alcance de visão (100-250)
                maxEnergy: Math.random() * 50 + 100,    // Energia máxima (100-150)
                efficiency: Math.random() * 0.5 + 0.5,  // Eficiência energética (0.5-1)
                reproductionRate: Math.random() * 0.3 + 0.7, // Taxa de reprodução (0.7-1)
                aggressiveness: Math.random(),          // Agressividade (0-1)
                socialness: Math.random(),              // Sociabilidade (0-1)
                // Genes de cor (RGB) - visual do DNA
                colorR: Math.random() * 255,
                colorG: Math.random() * 255,
                colorB: Math.random() * 255
            };
        }

        // Aplicar mutações
        this.mutate();
    }

    crossover(genes1, genes2) {
        const newGenes = {};
        for (let gene in genes1) {
            // 50% de chance de herdar de cada pai
            newGenes[gene] = Math.random() < 0.5 ? genes1[gene] : genes2[gene];
            // Pequena variação
            newGenes[gene] += (Math.random() - 0.5) * 0.1 * newGenes[gene];
        }
        return newGenes;
    }

    mutate() {
        const mutationRate = 0.1; // 10% de chance de mutação por gene
        const mutationStrength = 0.3; // Força da mutação

        for (let gene in this.genes) {
            if (Math.random() < mutationRate) {
                const change = (Math.random() - 0.5) * mutationStrength * this.genes[gene];
                this.genes[gene] += change;

                // Limitar valores
                if (gene === 'speed') this.genes[gene] = Math.max(0.5, Math.min(6, this.genes[gene]));
                else if (gene === 'size') this.genes[gene] = Math.max(4, Math.min(20, this.genes[gene]));
                else if (gene === 'visionRange') this.genes[gene] = Math.max(50, Math.min(400, this.genes[gene]));
                else if (gene === 'maxEnergy') this.genes[gene] = Math.max(50, Math.min(250, this.genes[gene]));
                else if (gene === 'efficiency') this.genes[gene] = Math.max(0.3, Math.min(1.5, this.genes[gene]));
                else if (gene === 'reproductionRate') this.genes[gene] = Math.max(0.5, Math.min(1.2, this.genes[gene]));
                else if (gene === 'aggressiveness') this.genes[gene] = Math.max(0, Math.min(1, this.genes[gene]));
                else if (gene === 'socialness') this.genes[gene] = Math.max(0, Math.min(1, this.genes[gene]));
                else if (gene.startsWith('color')) this.genes[gene] = Math.max(0, Math.min(255, this.genes[gene]));
            }
        }
    }

    getColor(type) {
        const r = Math.floor(this.genes.colorR);
        const g = Math.floor(this.genes.colorG);
        const b = Math.floor(this.genes.colorB);

        if (type === 'herbivore') {
            // Herbívoras: tons de verde/cyan
            return `rgb(${r * 0.3}, ${150 + g * 0.4}, ${b * 0.5})`;
        } else {
            // Carnívoras: tons de vermelho/rosa
            return `rgb(${150 + r * 0.4}, ${g * 0.3}, ${100 + b * 0.3})`;
        }
    }
}

// ==========================================
// CLASSE BACTÉRIA
// ==========================================

class Bacteria {
    constructor(x, y, type, dna = null, generation = 1) {
        this.x = x;
        this.y = y;
        this.type = type; // 'herbivore' ou 'carnivore'
        this.dna = dna || new DNA();
        this.generation = generation;
        this.gender = Math.random() < 0.5 ? 'male' : 'female';

        // Atributos baseados no DNA
        this.speed = this.dna.genes.speed;
        this.size = this.dna.genes.size;
        this.visionRange = this.dna.genes.visionRange;
        this.maxEnergy = this.dna.genes.maxEnergy;
        this.energy = this.maxEnergy;
        this.efficiency = this.dna.genes.efficiency;
        this.reproductionRate = this.dna.genes.reproductionRate;
        this.aggressiveness = this.dna.genes.aggressiveness;
        this.socialness = this.dna.genes.socialness;

        // Estado
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.angle = Math.random() * Math.PI * 2;
        this.state = 'wandering'; // wandering, seeking, fleeing, mating
        this.target = null;
        this.group = [];
        this.offspring = 0;
        this.age = 0;
        this.reproductionCooldown = 0;
        this.color = this.dna.getColor(type);

        // Trail para visualização
        this.trail = [];
        this.maxTrailLength = 20;
    }

    // ==========================================
    // IA AVANÇADA - SISTEMA DE DECISÃO
    // ==========================================

    update(bacteria, food) {
        this.age++;
        this.energy -= (this.size * 0.02) / this.efficiency; // Consumo de energia
        this.reproductionCooldown = Math.max(0, this.reproductionCooldown - 1);

        if (this.energy <= 0) {
            return false; // Morre
        }

        // Resetar aceleração
        this.acceleration = { x: 0, y: 0 };

        // IA: Analisar ambiente e tomar decisões
        const perception = this.perceive(bacteria, food);
        const decision = this.decide(perception);
        this.act(decision, perception);

        // Atualizar física
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;

        // Limitar velocidade
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (speed > this.speed) {
            this.velocity.x = (this.velocity.x / speed) * this.speed;
            this.velocity.y = (this.velocity.y / speed) * this.speed;
        }

        // Aplicar velocidade
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Bordas do mundo (wrap around)
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Atualizar ângulo
        if (speed > 0.1) {
            this.angle = Math.atan2(this.velocity.y, this.velocity.x);
        }

        // Trail
        if (gameState.showTrails) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }

        return true; // Sobrevive
    }

    perceive(bacteria, food) {
        const perception = {
            nearbyFood: [],
            nearbyAllies: [],
            nearbyEnemies: [],
            nearbyMates: [],
            threats: [],
            opportunities: []
        };

        // Detectar comida
        for (let f of food) {
            const dist = this.distance(f);
            if (dist < this.visionRange) {
                if (this.type === 'herbivore') {
                    perception.nearbyFood.push({ obj: f, dist });
                }
            }
        }

        // Detectar outras bactérias
        for (let b of bacteria) {
            if (b === this) continue;

            const dist = this.distance(b);
            if (dist < this.visionRange) {
                // Carnívoras veem herbívoras como comida
                if (this.type === 'carnivore' && b.type === 'herbivore') {
                    perception.nearbyFood.push({ obj: b, dist });
                }
                // Herbívoras veem carnívoras como ameaça
                else if (this.type === 'herbivore' && b.type === 'carnivore') {
                    perception.threats.push({ obj: b, dist });
                }
                // Mesmo tipo - potenciais aliados
                else if (this.type === b.type) {
                    perception.nearbyAllies.push({ obj: b, dist });

                    // Parceiro para reprodução
                    if (b.gender !== this.gender &&
                        b.reproductionCooldown === 0 &&
                        this.reproductionCooldown === 0 &&
                        this.energy > this.maxEnergy * 0.7 &&
                        b.energy > b.maxEnergy * 0.7) {
                        perception.nearbyMates.push({ obj: b, dist });
                    }
                }
            }
        }

        // Ordenar por distância
        perception.nearbyFood.sort((a, b) => a.dist - b.dist);
        perception.nearbyAllies.sort((a, b) => a.dist - b.dist);
        perception.threats.sort((a, b) => a.dist - b.dist);
        perception.nearbyMates.sort((a, b) => a.dist - b.dist);

        return perception;
    }

    decide(perception) {
        // Sistema de prioridades baseado em IA
        const priorities = {
            flee: 0,
            eat: 0,
            mate: 0,
            socialize: 0,
            wander: 0.1
        };

        // Ameaça = alta prioridade
        if (perception.threats.length > 0) {
            const closestThreat = perception.threats[0];
            priorities.flee = 1.0 / (closestThreat.dist / 100 + 0.1);
        }

        // Fome = prioridade baseada em energia
        if (perception.nearbyFood.length > 0) {
            const hungerLevel = 1 - (this.energy / this.maxEnergy);
            const closestFood = perception.nearbyFood[0];
            priorities.eat = hungerLevel * (1.0 / (closestFood.dist / 100 + 0.1));

            // Carnívoras mais agressivas priorizam caça
            if (this.type === 'carnivore') {
                priorities.eat *= (0.5 + this.aggressiveness);
            }
        }

        // Reprodução = quando tem energia suficiente
        if (perception.nearbyMates.length > 0 && this.energy > this.maxEnergy * 0.7) {
            const closestMate = perception.nearbyMates[0];
            priorities.mate = this.reproductionRate * (1.0 / (closestMate.dist / 50 + 0.1));
        }

        // Socialização = formar grupos
        if (perception.nearbyAllies.length > 0) {
            priorities.socialize = this.socialness * 0.3;
        }

        // Escolher ação com maior prioridade
        let maxPriority = 0;
        let action = 'wander';

        for (let [act, priority] of Object.entries(priorities)) {
            if (priority > maxPriority) {
                maxPriority = priority;
                action = act;
            }
        }

        return { action, perception };
    }

    act(decision, perception) {
        const { action } = decision;

        switch (action) {
            case 'flee':
                this.flee(perception.threats[0].obj);
                this.state = 'fleeing';
                break;

            case 'eat':
                this.seek(perception.nearbyFood[0].obj);
                this.state = 'seeking';
                this.target = perception.nearbyFood[0].obj;
                break;

            case 'mate':
                this.seek(perception.nearbyMates[0].obj);
                this.state = 'mating';
                this.target = perception.nearbyMates[0].obj;
                break;

            case 'socialize':
                this.flock(perception.nearbyAllies);
                this.state = 'socializing';
                this.group = perception.nearbyAllies.slice(0, 5);
                break;

            case 'wander':
            default:
                this.wander();
                this.state = 'wandering';
                this.target = null;
                break;
        }
    }

    // ==========================================
    // COMPORTAMENTOS DE MOVIMENTO (STEERING)
    // ==========================================

    seek(target) {
        const desired = {
            x: target.x - this.x,
            y: target.y - this.y
        };

        const dist = Math.sqrt(desired.x ** 2 + desired.y ** 2);
        if (dist > 0) {
            desired.x = (desired.x / dist) * this.speed;
            desired.y = (desired.y / dist) * this.speed;
        }

        const steer = {
            x: desired.x - this.velocity.x,
            y: desired.y - this.velocity.y
        };

        this.applyForce(steer);
    }

    flee(target) {
        const desired = {
            x: this.x - target.x,
            y: this.y - target.y
        };

        const dist = Math.sqrt(desired.x ** 2 + desired.y ** 2);
        if (dist > 0) {
            desired.x = (desired.x / dist) * this.speed * 1.5; // Fuga é mais rápida
            desired.y = (desired.y / dist) * this.speed * 1.5;
        }

        const steer = {
            x: desired.x - this.velocity.x,
            y: desired.y - this.velocity.y
        };

        this.applyForce(steer);
    }

    wander() {
        // Movimento aleatório suave
        const wanderAngle = this.angle + (Math.random() - 0.5) * 0.5;
        const force = {
            x: Math.cos(wanderAngle) * 0.1,
            y: Math.sin(wanderAngle) * 0.1
        };
        this.applyForce(force);
    }

    flock(neighbors) {
        // Algoritmo de flocking (boids): separação, alinhamento, coesão
        if (neighbors.length === 0) return;

        let separation = { x: 0, y: 0 };
        let alignment = { x: 0, y: 0 };
        let cohesion = { x: 0, y: 0 };

        const separationRadius = this.size * 3;

        for (let neighbor of neighbors) {
            const b = neighbor.obj;
            const dist = neighbor.dist;

            // Separação - evitar colisões
            if (dist < separationRadius) {
                const diff = {
                    x: this.x - b.x,
                    y: this.y - b.y
                };
                if (dist > 0) {
                    diff.x /= dist;
                    diff.y /= dist;
                }
                separation.x += diff.x;
                separation.y += diff.y;
            }

            // Alinhamento - mesma direção
            alignment.x += b.velocity.x;
            alignment.y += b.velocity.y;

            // Coesão - ficar próximo
            cohesion.x += b.x;
            cohesion.y += b.y;
        }

        const count = neighbors.length;

        // Médias
        alignment.x /= count;
        alignment.y /= count;

        cohesion.x /= count;
        cohesion.y /= count;
        cohesion.x -= this.x;
        cohesion.y -= this.y;

        // Aplicar forças com pesos
        this.applyForce({ x: separation.x * 1.5, y: separation.y * 1.5 });
        this.applyForce({ x: alignment.x * 0.3, y: alignment.y * 0.3 });
        this.applyForce({ x: cohesion.x * 0.05, y: cohesion.y * 0.05 });
    }

    applyForce(force) {
        this.acceleration.x += force.x * 0.1;
        this.acceleration.y += force.y * 0.1;
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    distance(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    canReproduce() {
        return this.energy > this.maxEnergy * 0.7 && this.reproductionCooldown === 0;
    }

    // ==========================================
    // RENDERIZAÇÃO
    // ==========================================

    draw() {
        // Trail
        if (gameState.showTrails && this.trail.length > 1) {
            ctx.strokeStyle = this.color + '40';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
        }

        // Visão (se selecionada)
        if (gameState.selectedBacteria === this && gameState.showVision) {
            ctx.strokeStyle = this.color + '20';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.visionRange, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Corpo da bactéria
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Corpo principal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Borda
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Flagelo (cauda)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        const tailWave = Math.sin(this.age * 0.2) * 3;
        ctx.quadraticCurveTo(
            -this.size * 1.5, tailWave,
            -this.size * 2, tailWave * 1.5
        );
        ctx.stroke();

        // Núcleo (mostra energia)
        const energyRatio = this.energy / this.maxEnergy;
        ctx.fillStyle = `rgba(255, 255, 255, ${energyRatio * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.size * 0.2, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Ícone de gênero
        ctx.font = `${this.size}px Arial`;
        ctx.fillText(
            this.gender === 'male' ? '💙' : '💗',
            this.x - this.size * 0.5,
            this.y - this.size - 5
        );

        // Indicador de estado
        if (this.state === 'mating' && this.target) {
            ctx.strokeStyle = '#ff69b4';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Grupo (se mostrar grupos)
        if (gameState.showGroups && this.group.length > 0) {
            ctx.strokeStyle = this.color + '30';
            ctx.lineWidth = 1;
            for (let member of this.group) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(member.obj.x, member.obj.y);
                ctx.stroke();
            }
        }
    }
}

// ==========================================
// CLASSE ALIMENTO
// ==========================================

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.energy = 30;
        this.age = 0;
    }

    update() {
        this.age++;
        return this.age < 600; // Comida dura 10 segundos
    }

    draw() {
        const glow = Math.sin(this.age * 0.1) * 2 + 3;

        // Brilho
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size + glow
        );
        gradient.addColorStop(0, '#90ee90');
        gradient.addColorStop(1, 'rgba(144, 238, 144, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size + glow, 0, Math.PI * 2);
        ctx.fill();

        // Corpo
        ctx.fillStyle = '#90ee90';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ==========================================
// ESTADO DO JOGO
// ==========================================

const gameState = {
    bacteria: [],
    food: [],
    time: 0,
    generation: 1,
    paused: false,
    speed: 1,
    showVision: true,
    showGroups: true,
    showTrails: false,
    selectedBacteria: null,
    upgrades: [],
    upgradeTimer: 0,
    upgradeInterval: 600, // 10 segundos
    stats: {
        totalBorn: 0,
        totalDied: 0,
        herbivoreCount: 0,
        carnivoreCount: 0
    }
};

// ==========================================
// SISTEMA DE UPGRADES ROGUELIKE
// ==========================================

const upgradesList = [
    {
        title: '🌊 Dilúvio de Comida',
        description: 'Spawna 50 unidades de comida aleatoriamente',
        apply: () => {
            for (let i = 0; i < 50; i++) {
                gameState.food.push(new Food(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height
                ));
            }
            showNotification('🌊 Dilúvio de Comida!', 'Comida abundante apareceu');
        }
    },
    {
        title: '⚡ Super Velocidade',
        description: 'Todas as bactérias ficam 50% mais rápidas',
        apply: () => {
            for (let b of gameState.bacteria) {
                b.speed *= 1.5;
                b.dna.genes.speed *= 1.5;
            }
            showNotification('⚡ Super Velocidade!', 'Todas as bactérias aceleraram');
        }
    },
    {
        title: '🧬 Mutação Extrema',
        description: 'Causa mutação genética aleatória em todas as bactérias',
        apply: () => {
            for (let b of gameState.bacteria) {
                b.dna.mutate();
                b.dna.mutate(); // Mutação dupla
                b.color = b.dna.getColor(b.type);
                // Atualizar atributos
                b.speed = b.dna.genes.speed;
                b.size = b.dna.genes.size;
                b.visionRange = b.dna.genes.visionRange;
            }
            showNotification('🧬 Mutação Extrema!', 'DNA alterado drasticamente');
        }
    },
    {
        title: '💘 Época de Acasalamento',
        description: 'Remove cooldown de reprodução de todas as bactérias',
        apply: () => {
            for (let b of gameState.bacteria) {
                b.reproductionCooldown = 0;
                b.energy = Math.max(b.energy, b.maxEnergy * 0.8);
            }
            showNotification('💘 Época de Acasalamento!', 'Reprodução facilitada');
        }
    },
    {
        title: '🔥 Apocalipse Seletivo',
        description: 'Remove 30% das bactérias mais fracas',
        apply: () => {
            gameState.bacteria.sort((a, b) => (a.energy + a.size) - (b.energy + b.size));
            const toRemove = Math.floor(gameState.bacteria.length * 0.3);
            gameState.bacteria.splice(0, toRemove);
            showNotification('🔥 Apocalipse Seletivo!', `${toRemove} bactérias eliminadas`, 'danger');
        }
    },
    {
        title: '🌟 Benção Divina',
        description: 'Todas as bactérias ganham energia e ficam maiores',
        apply: () => {
            for (let b of gameState.bacteria) {
                b.energy = b.maxEnergy;
                b.size *= 1.2;
                b.dna.genes.size *= 1.2;
            }
            showNotification('🌟 Benção Divina!', 'Bactérias fortalecidas');
        }
    },
    {
        title: '🦠 Praga Carnívora',
        description: 'Spawna 5 carnívoras super agressivas',
        apply: () => {
            for (let i = 0; i < 5; i++) {
                const dna = new DNA();
                dna.genes.aggressiveness = 1;
                dna.genes.speed = 4;
                dna.genes.size = 15;
                const b = new Bacteria(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    'carnivore',
                    dna,
                    gameState.generation
                );
                gameState.bacteria.push(b);
            }
            showNotification('🦠 Praga Carnívora!', '5 predadores ferozes apareceram', 'danger');
        }
    },
    {
        title: '🧘 Evolução Pacífica',
        description: 'Aumenta sociabilidade de todas as bactérias',
        apply: () => {
            for (let b of gameState.bacteria) {
                b.socialness = Math.min(1, b.socialness + 0.5);
                b.dna.genes.socialness = b.socialness;
                if (b.type === 'carnivore') {
                    b.aggressiveness *= 0.5;
                    b.dna.genes.aggressiveness *= 0.5;
                }
            }
            showNotification('🧘 Evolução Pacífica!', 'Bactérias mais sociais');
        }
    },
    {
        title: '👁️ Olhos Aguçados',
        description: 'Dobra o alcance de visão de todas as bactérias',
        apply: () => {
            for (let b of gameState.bacteria) {
                b.visionRange *= 2;
                b.dna.genes.visionRange *= 2;
            }
            showNotification('👁️ Olhos Aguçados!', 'Visão aprimorada');
        }
    },
    {
        title: '⚖️ Equilíbrio Natural',
        description: 'Balanceia a população de herbívoras e carnívoras',
        apply: () => {
            const herbCount = gameState.bacteria.filter(b => b.type === 'herbivore').length;
            const carnCount = gameState.bacteria.filter(b => b.type === 'carnivore').length;
            const diff = Math.abs(herbCount - carnCount);

            if (herbCount > carnCount) {
                // Adicionar carnívoras
                for (let i = 0; i < Math.min(diff / 2, 10); i++) {
                    gameState.bacteria.push(new Bacteria(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        'carnivore',
                        null,
                        gameState.generation
                    ));
                }
            } else {
                // Adicionar herbívoras
                for (let i = 0; i < Math.min(diff / 2, 10); i++) {
                    gameState.bacteria.push(new Bacteria(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        'herbivore',
                        null,
                        gameState.generation
                    ));
                }
            }
            showNotification('⚖️ Equilíbrio Natural!', 'População balanceada');
        }
    }
];

function showUpgradeOptions() {
    const panel = document.getElementById('upgrades-panel');
    const container = document.getElementById('upgrade-options');
    container.innerHTML = '';

    // Selecionar 3 upgrades aleatórios
    const shuffled = [...upgradesList].sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 3);

    options.forEach(upgrade => {
        const div = document.createElement('div');
        div.className = 'upgrade-option';
        div.innerHTML = `
            <div class="upgrade-title">${upgrade.title}</div>
            <div class="upgrade-desc">${upgrade.description}</div>
        `;
        div.onclick = () => {
            upgrade.apply();
            panel.style.display = 'none';
            gameState.upgradeTimer = 0;
        };
        container.appendChild(div);
    });

    panel.style.display = 'block';
}

// ==========================================
// SISTEMA DE NOTIFICAÇÕES
// ==========================================

function showNotification(title, message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    container.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

function init() {
    gameState.bacteria = [];
    gameState.food = [];
    gameState.time = 0;
    gameState.generation = 1;
    gameState.selectedBacteria = null;
    gameState.upgradeTimer = 0;

    // Criar população inicial
    for (let i = 0; i < 15; i++) {
        gameState.bacteria.push(new Bacteria(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            'herbivore',
            null,
            1
        ));
    }

    for (let i = 0; i < 5; i++) {
        gameState.bacteria.push(new Bacteria(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            'carnivore',
            null,
            1
        ));
    }

    // Criar comida inicial
    for (let i = 0; i < 30; i++) {
        gameState.food.push(new Food(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    gameState.stats.totalBorn = gameState.bacteria.length;
}

// ==========================================
// LOOP PRINCIPAL
// ==========================================

let lastTime = 0;
let fps = 0;

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // FPS
    fps = Math.round(1000 / deltaTime);
    document.getElementById('fps-counter').textContent = `FPS: ${fps}`;

    if (gameState.paused) return;

    // Atualizar múltiplas vezes se speed > 1
    for (let speedStep = 0; speedStep < gameState.speed; speedStep++) {
        update();
    }

    render();
}

function update() {
    gameState.time++;
    gameState.upgradeTimer++;

    // Sistema de upgrades
    if (gameState.upgradeTimer >= gameState.upgradeInterval) {
        showUpgradeOptions();
        gameState.upgradeTimer = 0;
    }

    // Atualizar bactérias
    gameState.bacteria = gameState.bacteria.filter(b => {
        const survived = b.update(gameState.bacteria, gameState.food);
        if (!survived) {
            gameState.stats.totalDied++;
            if (gameState.selectedBacteria === b) {
                gameState.selectedBacteria = null;
            }
        }
        return survived;
    });

    // Atualizar comida
    gameState.food = gameState.food.filter(f => f.update());

    // Spawnar nova comida periodicamente
    if (Math.random() < 0.1 && gameState.food.length < 50) {
        gameState.food.push(new Food(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    // Verificar colisões e interações
    checkInteractions();

    // Atualizar estatísticas
    updateStats();

    // Game over check
    if (gameState.bacteria.length === 0) {
        showNotification('💀 Extinção!', 'Todas as bactérias morreram', 'danger');
        gameState.paused = true;
    }
}

function checkInteractions() {
    // Comer comida / outras bactérias
    for (let i = gameState.bacteria.length - 1; i >= 0; i--) {
        const b = gameState.bacteria[i];

        // Herbívoras comem plantas
        if (b.type === 'herbivore') {
            for (let j = gameState.food.length - 1; j >= 0; j--) {
                const f = gameState.food[j];
                if (b.distance(f) < b.size + f.size) {
                    b.energy = Math.min(b.maxEnergy, b.energy + f.energy);
                    gameState.food.splice(j, 1);
                    break;
                }
            }
        }

        // Carnívoras comem herbívoras
        if (b.type === 'carnivore') {
            for (let j = gameState.bacteria.length - 1; j >= 0; j--) {
                if (i === j) continue;
                const target = gameState.bacteria[j];

                if (target.type === 'herbivore' && b.distance(target) < b.size + target.size) {
                    // Maior come menor
                    if (b.size > target.size * 0.8) {
                        b.energy = Math.min(b.maxEnergy, b.energy + target.energy * 0.5);
                        gameState.bacteria.splice(j, 1);
                        if (j < i) i--; // Ajustar índice
                        gameState.stats.totalDied++;
                        break;
                    }
                }
            }
        }
    }

    // Reprodução
    for (let i = 0; i < gameState.bacteria.length; i++) {
        const b1 = gameState.bacteria[i];
        if (!b1.canReproduce()) continue;

        for (let j = i + 1; j < gameState.bacteria.length; j++) {
            const b2 = gameState.bacteria[j];

            if (b1.type === b2.type &&
                b1.gender !== b2.gender &&
                b2.canReproduce() &&
                b1.distance(b2) < b1.size + b2.size + 10) {

                // REPRODUÇÃO!
                const childDNA = new DNA(b1.dna, b2.dna);
                const child = new Bacteria(
                    (b1.x + b2.x) / 2 + (Math.random() - 0.5) * 20,
                    (b1.y + b2.y) / 2 + (Math.random() - 0.5) * 20,
                    b1.type,
                    childDNA,
                    Math.max(b1.generation, b2.generation) + 1
                );

                gameState.bacteria.push(child);
                gameState.generation = Math.max(gameState.generation, child.generation);

                // Custo de energia
                b1.energy -= b1.maxEnergy * 0.4;
                b2.energy -= b2.maxEnergy * 0.4;
                b1.reproductionCooldown = 300; // 5 segundos
                b2.reproductionCooldown = 300;
                b1.offspring++;
                b2.offspring++;

                gameState.stats.totalBorn++;

                // Efeito visual
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(child.x, child.y, 20, 0, Math.PI * 2);
                ctx.fill();

                break;
            }
        }
    }
}

function render() {
    // Limpar canvas
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar grid sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Desenhar comida
    for (let f of gameState.food) {
        f.draw();
    }

    // Desenhar bactérias
    for (let b of gameState.bacteria) {
        b.draw();
    }

    // Destacar bactéria selecionada
    if (gameState.selectedBacteria) {
        const b = gameState.selectedBacteria;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function updateStats() {
    const herbCount = gameState.bacteria.filter(b => b.type === 'herbivore').length;
    const carnCount = gameState.bacteria.filter(b => b.type === 'carnivore').length;

    gameState.stats.herbivoreCount = herbCount;
    gameState.stats.carnivoreCount = carnCount;

    document.getElementById('total-population').textContent = gameState.bacteria.length;
    document.getElementById('herbivore-count').textContent = herbCount;
    document.getElementById('carnivore-count').textContent = carnCount;
    document.getElementById('food-count').textContent = gameState.food.length;
    document.getElementById('game-time').textContent = Math.floor(gameState.time / 60) + 's';
    document.getElementById('generation-count').textContent = gameState.generation;
}

function updateSelectedBacteriaInfo() {
    const b = gameState.selectedBacteria;
    const details = document.getElementById('bacteria-details');
    const placeholder = document.querySelector('.info-placeholder');

    if (!b || gameState.bacteria.indexOf(b) === -1) {
        details.style.display = 'none';
        placeholder.style.display = 'block';
        gameState.selectedBacteria = null;
        return;
    }

    details.style.display = 'block';
    placeholder.style.display = 'none';

    // DNA Visualization
    const dnaViz = document.getElementById('dna-viz');
    dnaViz.innerHTML = `
        <div class="dna-strand">
            <span class="dna-label">Velocidade:</span>
            <div class="dna-genes">
                ${generateGeneBar(b.dna.genes.speed, 6, '#60efff')}
            </div>
        </div>
        <div class="dna-strand">
            <span class="dna-label">Tamanho:</span>
            <div class="dna-genes">
                ${generateGeneBar(b.dna.genes.size, 20, '#00ff87')}
            </div>
        </div>
        <div class="dna-strand">
            <span class="dna-label">Visão:</span>
            <div class="dna-genes">
                ${generateGeneBar(b.dna.genes.visionRange, 400, '#ff6ec4')}
            </div>
        </div>
        <div class="dna-strand">
            <span class="dna-label">Social:</span>
            <div class="dna-genes">
                ${generateGeneBar(b.dna.genes.socialness, 1, '#ffd700')}
            </div>
        </div>
    `;

    document.getElementById('selected-type').textContent =
        b.type === 'herbivore' ? '🌱 Herbívora' : '🦷 Carnívora';
    document.getElementById('selected-gender').textContent =
        b.gender === 'male' ? '💙 Macho' : '💗 Fêmea';
    document.getElementById('selected-generation').textContent = b.generation;
    document.getElementById('selected-energy').style.width =
        (b.energy / b.maxEnergy * 100) + '%';
    document.getElementById('selected-speed').textContent = b.speed.toFixed(1);
    document.getElementById('selected-size').textContent = b.size.toFixed(1);
    document.getElementById('selected-vision').textContent = Math.floor(b.visionRange);
    document.getElementById('selected-offspring').textContent = b.offspring;
}

function generateGeneBar(value, max, color) {
    const count = Math.floor((value / max) * 15);
    let html = '';
    for (let i = 0; i < 15; i++) {
        const opacity = i < count ? 1 : 0.2;
        html += `<div class="gene" style="background-color: ${color}; opacity: ${opacity};"></div>`;
    }
    return html;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Click no canvas
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Ajustar para escala do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    // Encontrar bactéria clicada
    let closest = null;
    let minDist = 50; // Distância máxima para seleção

    for (let b of gameState.bacteria) {
        const dist = Math.sqrt((b.x - canvasX) ** 2 + (b.y - canvasY) ** 2);
        if (dist < minDist && dist < b.size + 10) {
            minDist = dist;
            closest = b;
        }
    }

    gameState.selectedBacteria = closest;
});

// Controles
document.getElementById('pause-btn').addEventListener('click', () => {
    gameState.paused = !gameState.paused;
    const btn = document.getElementById('pause-btn');
    btn.textContent = gameState.paused ? '▶️ Continuar' : '⏸️ Pausar';
});

document.getElementById('speed-btn').addEventListener('click', () => {
    const speeds = [1, 2, 5, 10];
    const currentIndex = speeds.indexOf(gameState.speed);
    gameState.speed = speeds[(currentIndex + 1) % speeds.length];
    document.getElementById('speed-btn').textContent = `⏩ Velocidade: ${gameState.speed}x`;
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja reiniciar a simulação?')) {
        init();
        showNotification('🔄 Reiniciado', 'Nova simulação iniciada');
    }
});

document.getElementById('show-vision').addEventListener('change', (e) => {
    gameState.showVision = e.target.checked;
});

document.getElementById('show-groups').addEventListener('change', (e) => {
    gameState.showGroups = e.target.checked;
});

document.getElementById('show-trails').addEventListener('change', (e) => {
    gameState.showTrails = e.target.checked;
});

// ==========================================
// INÍCIO DO JOGO
// ==========================================

init();
gameLoop(0);

// Atualizar info da bactéria selecionada a cada frame
setInterval(() => {
    if (gameState.selectedBacteria) {
        updateSelectedBacteriaInfo();
    }
}, 100);

// Mensagem de boas-vindas
setTimeout(() => {
    showNotification(
        '🦠 Bem-vindo!',
        'Observe as bactérias evoluírem. Clique nelas para ver seus genes!'
    );
}, 1000);
