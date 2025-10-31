# 🦠 Simulador de Evolução de Bactérias com IA

Um jogo de simulação avançado onde você observa bactérias com inteligência artificial evoluírem em tempo real, competirem por recursos e passarem seu DNA para as próximas gerações.

## 🎮 Como Jogar

1. Abra `bacteria-game.html` no navegador
2. Observe as bactérias interagirem autonomamente
3. Clique em uma bactéria para ver seus genes e estatísticas
4. A cada 10 segundos, escolha um upgrade roguelike para modificar o ecossistema
5. Controle a velocidade da simulação e visualizações

## 🧬 Características Principais

### Sistema Genético Avançado
- **DNA Completo**: Cada bactéria possui genes que controlam velocidade, tamanho, visão, eficiência energética, sociabilidade e agressividade
- **Herança Genética**: Reprodução sexual combina DNA dos pais (crossover genético)
- **Mutações**: Mutações aleatórias ocorrem durante reprodução, criando variabilidade
- **Visualização Visual**: Cores diferentes representam DNA único - você pode VER a evolução acontecendo

### IA Inteligente (Sistema de Decisão)
As bactérias tomam decisões baseadas em:
- **Percepção do Ambiente**: Detectam comida, aliados, ameaças e parceiros dentro do alcance de visão
- **Sistema de Prioridades**: Avaliam múltiplas ações (fugir, comer, reproduzir, socializar) e escolhem a melhor
- **Comportamentos Adaptativos**:
  - 🟢 Herbívoras: Buscam plantas, fogem de predadores, formam grupos de proteção
  - 🔴 Carnívoras: Caçam herbívoras, usam agressividade para determinar comportamento
  - 👥 Socialização: Bactérias com alta sociabilidade formam grupos (algoritmo de flocking/boids)

### Formação de Grupos (Flocking)
Implementação do algoritmo de Craig Reynolds (Boids):
- **Separação**: Evitam colisões com vizinhos próximos
- **Alinhamento**: Movem-se na mesma direção do grupo
- **Coesão**: Mantêm-se próximos aos membros do grupo
- Bactérias com maior gene de sociabilidade formam grupos maiores e mais coesos

### Ecossistema Dinâmico
- **Cadeia Alimentar**: Plantas → Herbívoras → Carnívoras
- **Balanço Energético**: Consumo de energia baseado em tamanho e eficiência
- **Reprodução Sexual**: Requer macho + fêmea do mesmo tipo, ambos com energia suficiente
- **Seleção Natural**: Apenas os mais adaptados sobrevivem e reproduzem

### Sistema Roguelike
A cada 10 segundos, escolha entre 3 upgrades aleatórios:
- 🌊 **Dilúvio de Comida**: Spawna recursos abundantes
- ⚡ **Super Velocidade**: Acelera todas as bactérias
- 🧬 **Mutação Extrema**: Causa mutações drásticas no DNA
- 💘 **Época de Acasalamento**: Facilita reprodução
- 🔥 **Apocalipse Seletivo**: Remove os mais fracos
- 🌟 **Benção Divina**: Fortalece toda a população
- 🦠 **Praga Carnívora**: Adiciona predadores agressivos
- 🧘 **Evolução Pacífica**: Aumenta sociabilidade
- 👁️ **Olhos Aguçados**: Dobra alcance de visão
- ⚖️ **Equilíbrio Natural**: Balanceia populações

## 🎯 Recursos Visuais

### Diferenciação Genética Visível
- **Cores Únicas**: Cada bactéria tem cor baseada em genes RGB
- **Tamanhos Variados**: Gene de tamanho afeta renderização
- **Ícones de Gênero**: 💙 Macho | 💗 Fêmea
- **Indicadores de Estado**: Linhas mostram busca de parceiros
- **Rastros Opcionais**: Veja o caminho percorrido

### Painel de Informações
- **Estatísticas Globais**: População, gerações, tempo
- **DNA Detalhado**: Visualização de genes em barras coloridas
- **Informações Individuais**: Energia, velocidade, visão, descendentes
- **Alcance de Visão**: Círculo mostra o que a bactéria pode detectar

## 🎮 Controles

- **Pausar/Continuar**: Pausa a simulação
- **Velocidade**: Alterna entre 1x, 2x, 5x, 10x
- **Reiniciar**: Nova simulação do zero
- **Visualizações**: Toggle de visão, grupos e rastros
- **Clique**: Selecione bactérias para ver detalhes

## 🧪 Experimentos Interessantes

1. **Evolução Direcional**: Use upgrades para pressionar a evolução em direções específicas
2. **Extinção em Massa**: Veja como o ecossistema se recupera após apocalipse
3. **Superpredadores**: Observe carnívoras ultra-agressivas dominarem
4. **Sociedades Pacíficas**: Aumente sociabilidade e observe formação de megagrupos
5. **Corrida Armamentista**: Herbívoras ficam rápidas, carnívoras também - quem vence?

## 💡 Conceitos de IA Implementados

- **Steering Behaviors**: Seek, Flee, Wander
- **Flocking/Boids**: Comportamento emergente de grupo
- **Sistema de Decisão Baseado em Prioridades**: Avaliação de múltiplas ações
- **Percepção Limitada**: Visão como sensor (field of view)
- **Algoritmos Genéticos**: Crossover, mutação, seleção natural
- **Agentes Autônomos**: Cada bactéria é um agente independente

## 🔬 Detalhes Técnicos

### Genes e Seus Efeitos
| Gene | Efeito | Range |
|------|--------|-------|
| speed | Velocidade de movimento | 0.5 - 6 |
| size | Tamanho visual e colisão | 4 - 20 |
| visionRange | Distância de detecção | 50 - 400 |
| maxEnergy | Energia máxima | 50 - 250 |
| efficiency | Eficiência energética | 0.3 - 1.5 |
| reproductionRate | Taxa de reprodução | 0.5 - 1.2 |
| aggressiveness | Agressividade (carnívoras) | 0 - 1 |
| socialness | Tendência a formar grupos | 0 - 1 |
| colorR/G/B | Cor visual do DNA | 0 - 255 |

### Performance
- Canvas otimizado para 60 FPS
- Controle de velocidade até 10x
- Suporta centenas de bactérias simultaneamente

## 🌟 Observações Emergentes

Durante a simulação, você pode observar:
- **Especiação Visual**: Grupos com cores similares (família genética)
- **Nichos Ecológicos**: Carnívoras grandes e lentas vs rápidas e pequenas
- **Comportamento de Manada**: Herbívoras formando grupos defensivos
- **Estratégias de Caça**: Carnívoras perseguindo presas isoladas
- **Trade-offs Evolutivos**: Velocidade vs tamanho vs eficiência

## 🎨 Créditos

Criado com JavaScript puro e Canvas API, implementando conceitos de:
- Inteligência Artificial
- Algoritmos Genéticos
- Sistemas Complexos
- Vida Artificial

---

**Divirta-se observando a evolução acontecer em tempo real!** 🦠🧬✨
