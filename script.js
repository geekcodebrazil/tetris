/* eslint-disable no-unused-vars, no-redeclare */ // Desativa avisos ESLint comuns em código legado
// TODO:
// - Implementar mensagem de 'Game Over' de forma mais integrada (talvez overlay)
// - Avaliar melodia (manter ou usar alternativas web audio API)
// - Refatorar função gameOver para mais clareza
// - Revisar bugs conhecidos e lógica de colisão/rotação

// --- Configuração Inicial e Variáveis Globais ---
let level = 0;
let score = 0;
let lines = 0;

// Referências aos elementos Canvas
const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const currentFormCanvas = document.getElementById("nextFormCanvas"); // Renomeado para 'nextFormCanvas' no HTML
const currentFormContext = currentFormCanvas.getContext("2d");

// Estado do Jogo
let paused = false;
let gameOverState = false; // Flag para indicar se o jogo terminou
let nextForm = getRandomInt(0, 6); // Determina a próxima peça

// Configurações do Tabuleiro e Movimento
const width = 10;  // Largura do tabuleiro em blocos
const height = 22; // Altura do tabuleiro (20 visíveis + 2 buffer no topo)
let basicVelocity = 480; // Velocidade inicial de queda (em milissegundos) - Aumentada para começar mais devagar
let timeInterval = basicVelocity; // Intervalo atual do loop principal

// Direção de movimento (controlada pelo teclado)
let xDirection = 0;
let yDirection = 1; // Sempre cai para baixo inicialmente

// Tabuleiro do jogo (matriz)
const board = new Array(height);
for (let i = 0; i < board.length; i++) {
    board[i] = new Array(width).fill(''); // '' representa célula vazia
}

// Peça Ativa (Tetromino)
let activeForm = {
    form: 0,
    modification: 0, // Rotação
    color: "var(--color-form-0)", // Usa variável CSS
    points: [ // Posição inicial dos blocos (exemplo)
        { 'x': 0, 'y': 0 },
        { 'x': 1, 'y': 0 },
        { 'x': 2, 'y': 0 },
        { 'x': 3, 'y': 0 }
    ]
};

// --- Áudio ---
// Considerar usar Web Audio API para melhor controle
let audio = null; // Inicializa como null
try {
    audio = new Audio('assets/sound/tetris_soundtrack.mp3'); // Tenta carregar
    // Loop do áudio
    audio.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);
} catch (e) {
    console.error("Não foi possível carregar ou reproduzir o áudio:", e);
    // Opcional: Mostrar uma mensagem ao usuário sobre o erro do áudio
}


// --- Referências a Elementos do DOM ---
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const linesDisplay = document.getElementById("lines");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const retryButton = document.getElementById("retryButton"); // Renomeado para 'Novo Jogo' no HTML/CSS
const gameDiv = document.getElementById("gameDiv");
const formDiv = document.getElementById("formDiv");
const scoreField = document.getElementById("scoreField");
const nameField = document.getElementById("nameField"); // Adicionado para referência futura, se necessário
const playAgainButton = document.getElementById("playAgainButton");


// --- Vinculação de Eventos ---
resetButton.addEventListener('click', resetGameState);
pauseButton.addEventListener('click', togglePause);
retryButton.addEventListener('click', startNewGame); // 'Novo Jogo' chama startNewGame
playAgainButton.addEventListener('click', startNewGameFromForm); // Botão no formulário

document.body.addEventListener('keydown', handleKeyDown);
document.body.addEventListener('keyup', handleKeyUp);

// --- Funções Auxiliares ---

/**
 * Gera um número inteiro aleatório entre min e max (inclusivo).
 * @param {number} min - O valor mínimo.
 * @param {number} max - O valor máximo.
 * @returns {number} - Um inteiro aleatório.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 // ========== COLE ESTE NOVO BLOCO NO LUGAR DO ANTIGO ==========
/**
 * Obtém o VALOR COMPUTADO da cor CSS correspondente ao número da forma.
 * @param {number} formNumber - O número da forma (0-6).
 * @returns {string} - O valor da cor CSS computado (ex: '#50fa7b').
 */
function getFormColor(formNumber) {
    // Mapeia o número da forma para o NOME da variável CSS.
    const varNameMap = [
        '--color-form-0', '--color-form-1', '--color-form-2',
        '--color-form-3', '--color-form-4', '--color-form-5',
        '--color-form-6'
    ];
    const varName = varNameMap[formNumber] || '--text-color'; // Fallback

    // Usa getComputedStyle para obter o VALOR REAL da variável CSS.
    // document.documentElement é usado para obter variáveis definidas em :root.
    // .trim() remove espaços em branco extras que alguns navegadores podem adicionar.
    try {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    } catch (e) {
        console.error(`Erro ao obter valor da variável CSS: ${varName}`, e);
        // Retorna uma cor padrão em caso de erro
        return '#ffffff'; // Branco como fallback extremo
    }
}
// ========== FIM DO NOVO BLOCO ==========

// --- Funções de Desenho ---

/**
 * Desenha um único bloco do Tetromino no canvas principal.
 * @param {number} x - Coordenada X no tabuleiro.
 * @param {number} y - Coordenada Y no tabuleiro (ajustada para buffer).
 * @param {string} color - A cor do bloco (ex: 'red', 'var(--neon-green)').
 */
function drawRectangle(x, y, color) {
    // Ajusta Y para não desenhar na área de buffer (as 2 primeiras linhas)
    const drawY = y - 2;
    if (drawY < 0) return; // Não desenha blocos acima da área visível

    context.fillStyle = color;
    context.fillRect((x * 20) + 1, (drawY * 20) + 1, 18, 18); // +1 e 18 para criar um pequeno espaçamento/borda
    // Opcional: Adicionar uma borda mais clara para efeito 3D
    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    context.strokeRect((x * 20) + 0.5, (drawY * 20) + 0.5, 19, 19);
}

/**
 * Desenha todo o tabuleiro, incluindo os blocos fixos.
 */
function drawBoard() {
    // Limpa apenas a área visível do canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 2; y < height; y++) { // Começa de 2 para ignorar o buffer
        for (let x = 0; x < width; x++) {
            if (board[y][x] !== '') {
                drawRectangle(x, y, board[y][x]); // Usa a cor armazenada no tabuleiro
            }
        }
    }
    // Desenha a peça ativa por cima
    drawActiveForm();
}

/**
 * Desenha a peça ativa (Tetromino) na sua posição atual.
 */
function drawActiveForm() {
    activeForm.points.forEach(point => {
        drawRectangle(point.x, point.y, activeForm.color);
    });
}


/**
 * Desenha um bloco no canvas de visualização da próxima peça.
 * @param {number} x - Coordenada X no canvas pequeno.
 * @param {number} y - Coordenada Y no canvas pequeno.
 * @param {string} color - A cor do bloco.
 */
function drawRectangleNextForm(x, y, color) {
    currentFormContext.fillStyle = color;
    currentFormContext.fillRect((x * 20) + 1, (y * 20) + 1, 18, 18);
     // Opcional: Borda clara
    currentFormContext.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    currentFormContext.strokeRect((x * 20) + 0.5, (y * 20) + 0.5, 19, 19);
}

/**
 * Desenha a próxima peça no canvas de visualização.
 * @param {number} form - O número da próxima forma (0-6).
 */
function drawNextFormPreview(form) {
    currentFormContext.clearRect(0, 0, currentFormCanvas.width, currentFormCanvas.height);
    const color = getFormColor(form);
    // As coordenadas X/Y são ajustadas para centralizar a peça no canvas pequeno
    switch (form) {
        case 0: // I
            drawRectangleNextForm(1, 1, color); drawRectangleNextForm(2, 1, color); drawRectangleNextForm(3, 1, color); drawRectangleNextForm(4, 1, color);
            break;
        case 1: // L
            drawRectangleNextForm(1, 1, color); drawRectangleNextForm(1, 2, color); drawRectangleNextForm(2, 2, color); drawRectangleNextForm(3, 2, color);
            break;
        case 2: // J
            drawRectangleNextForm(3, 1, color); drawRectangleNextForm(1, 2, color); drawRectangleNextForm(2, 2, color); drawRectangleNextForm(3, 2, color);
            break;
        case 3: // O
            drawRectangleNextForm(2, 1, color); drawRectangleNextForm(3, 1, color); drawRectangleNextForm(2, 2, color); drawRectangleNextForm(3, 2, color);
            break;
        case 4: // S
            drawRectangleNextForm(2, 1, color); drawRectangleNextForm(3, 1, color); drawRectangleNextForm(1, 2, color); drawRectangleNextForm(2, 2, color);
            break;
        case 5: // T
            drawRectangleNextForm(2, 1, color); drawRectangleNextForm(1, 2, color); drawRectangleNextForm(2, 2, color); drawRectangleNextForm(3, 2, color);
            break;
        case 6: // Z
            drawRectangleNextForm(1, 1, color); drawRectangleNextForm(2, 1, color); drawRectangleNextForm(2, 2, color); drawRectangleNextForm(3, 2, color);
            break;
    }
}


// --- Lógica do Jogo ---

/**
 * Cria e posiciona uma nova peça no topo do tabuleiro.
 */
function buildNewForm() {
    const formType = nextForm; // Usa a peça que estava na pré-visualização
    activeForm.form = formType;
    activeForm.modification = 0; // Reseta rotação
    activeForm.color = getFormColor(formType);

    let startX = Math.floor(width / 2) - 2; // Posição inicial X (aproximadamente central)
    let startY = 0; // Posição inicial Y (no topo do buffer)

    // Define os pontos iniciais de cada forma
    // As coordenadas Y podem precisar de ajuste dependendo se a peça começa "acima" do tabuleiro visível
    switch (formType) {
        case 0: // I ----
            activeForm.points = [{ x: startX, y: startY + 1 }, { x: startX + 1, y: startY + 1 }, { x: startX + 2, y: startY + 1 }, { x: startX + 3, y: startY + 1 }];
            break;
        case 1: // L  *---
            activeForm.points = [{ x: startX + 0, y: startY + 0 }, { x: startX + 0, y: startY + 1 }, { x: startX + 1, y: startY + 1 }, { x: startX + 2, y: startY + 1 }];
            break;
        case 2: // J ---*
            activeForm.points = [{ x: startX + 2, y: startY + 0 }, { x: startX + 0, y: startY + 1 }, { x: startX + 1, y: startY + 1 }, { x: startX + 2, y: startY + 1 }];
            break;
        case 3: // O  [][]
            activeForm.points = [{ x: startX + 1, y: startY + 0 }, { x: startX + 2, y: startY + 0 }, { x: startX + 1, y: startY + 1 }, { x: startX + 2, y: startY + 1 }];
            break;
        case 4: // S  --**
            activeForm.points = [{ x: startX + 1, y: startY + 0 }, { x: startX + 2, y: startY + 0 }, { x: startX + 0, y: startY + 1 }, { x: startX + 1, y: startY + 1 }];
            break;
        case 5: // T  -*-
            activeForm.points = [{ x: startX + 1, y: startY + 0 }, { x: startX + 0, y: startY + 1 }, { x: startX + 1, y: startY + 1 }, { x: startX + 2, y: startY + 1 }];
            break;
        case 6: // Z  **--
            activeForm.points = [{ x: startX + 0, y: startY + 0 }, { x: startX + 1, y: startY + 0 }, { x: startX + 1, y: startY + 1 }, { x: startX + 2, y: startY + 1 }];
            break;
    }

    // Ajusta a posição inicial X para evitar sair da tela logo de cara
    let minX = width, maxX = -1;
     activeForm.points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
     });
     if(minX < 0) {
         const shift = -minX;
         activeForm.points.forEach(p => p.x += shift);
     } else if (maxX >= width) {
         const shift = maxX - (width - 1);
         activeForm.points.forEach(p => p.x -= shift);
     }


    // Define a próxima peça e atualiza a pré-visualização
    nextForm = getRandomInt(0, 6);
    drawNextFormPreview(nextForm);

     // Verifica colisão imediata (Game Over)
     if (checkCollision(activeForm.points)) {
         triggerGameOver();
     }
}


/**
 * Verifica se uma dada posição (conjunto de pontos) colide com os limites ou blocos existentes.
 * @param {Array<Object>} position - Um array de pontos {x, y} representando a posição a verificar.
 * @returns {boolean} - True se houver colisão, false caso contrário.
 */
function checkCollision(position) {
    for (const point of position) {
        // Verifica colisão com as bordas laterais e inferior
        if (point.x < 0 || point.x >= width || point.y >= height) {
            return true;
        }
        // Verifica colisão com blocos existentes no tabuleiro (ignora y < 0)
        // Importante: Certifique-se de que y é um índice válido
        if (point.y >= 0 && board[point.y] && board[point.y][point.x] !== '') {
            return true;
        }
    }
    return false; // Nenhuma colisão encontrada
}


/**
 * Move a peça ativa na direção especificada (xDir, yDir).
 * Se o movimento vertical causar colisão, fixa a peça no lugar.
 * @param {number} xDir - Movimento horizontal (-1, 0, 1).
 * @param {number} yDir - Movimento vertical (0, 1).
 */
function moveActiveForm(xDir, yDir) {
    const newPosition = activeForm.points.map(point => ({
        x: point.x + xDir,
        y: point.y + yDir
    }));

    if (!checkCollision(newPosition)) {
        // Movimento válido, atualiza a posição da peça ativa
        activeForm.points = newPosition;
    } else {
        // Colisão detectada
        if (yDir > 0) {
            // Se a colisão ocorreu ao mover para baixo, a peça aterrissou
            fixFormToBoard(); // Fixa a peça no tabuleiro
            clearFullLines(); // Verifica e limpa linhas completas
            buildNewForm(); // Cria a próxima peça (pode dar Game Over aqui)
            // Verifica se a nova peça já colide (Game Over)
            if (gameOverState) return; // Já estamos em Game Over, não faz mais nada
        }
        // Se a colisão foi horizontal (yDir == 0), o movimento é simplesmente bloqueado
        // e a peça não se move horizontalmente.
    }

    // Reseta a direção horizontal após o movimento ser processado
    // Isso previne movimento contínuo se a tecla for mantida pressionada sem um sistema de repetição de tecla
    // (No loop principal, xDirection será reaplicado se a tecla ainda estiver pressionada)
     //xDirection = 0; // Removido daqui, será tratado no loop principal e key events
}

/**
 * Fixa a peça ativa atual no tabuleiro, tornando seus blocos permanentes.
 */
function fixFormToBoard() {
    activeForm.points.forEach(point => {
        // Garante que estamos escrevendo dentro dos limites do tabuleiro
        if (point.y >= 0 && point.y < height && point.x >= 0 && point.x < width) {
            board[point.y][point.x] = activeForm.color;
        }
         // Se um bloco for fixado nas linhas de buffer (0 ou 1), é Game Over
         // Uma verificação mais robusta é feita em buildNewForm
         // if (point.y < 2) {
         //    triggerGameOver();
         // }
    });
}

/**
 * Verifica e limpa quaisquer linhas completas no tabuleiro.
 */
function clearFullLines() {
    let linesCleared = 0;
    for (let y = height - 1; y >= 0; y--) { // Verifica de baixo para cima
        let isLineFull = true;
        for (let x = 0; x < width; x++) {
            if (board[y][x] === '') {
                isLineFull = false;
                break; // Linha não está completa
            }
        }

        if (isLineFull) {
            linesCleared++;
            // Remove a linha completa movendo todas as linhas acima para baixo
            for (let k = y; k > 0; k--) { // Move de y para cima
                board[k] = [...board[k - 1]]; // Copia a linha de cima
            }
            // Cria uma nova linha vazia no topo
            board[0] = new Array(width).fill('');
            // Como uma linha foi removida e as de cima desceram,
            // precisamos verificar a mesma linha 'y' novamente na próxima iteração do loop principal de 'y'
            y++; // Incrementa y para re-verificar a linha que acabou de descer
        }
    }

    if (linesCleared > 0) {
        updateStats(linesCleared); // Atualiza pontuação, linhas e nível
    }
}

/**
 * Tenta rotacionar a peça ativa.
 */
function rotateActiveForm() {
    // Peça 'O' (Quadrado) não rotaciona
    if (activeForm.form === 3) return;

    const originalPoints = activeForm.points.map(p => ({...p})); // Cópia profunda
    const center = activeForm.points[1]; // Ponto de pivô (geralmente o segundo bloco)

    const rotatedPoints = activeForm.points.map(point => {
        // Translada para a origem (relativo ao pivô)
        let relX = point.x - center.x;
        let relY = point.y - center.y;

        // Rotaciona 90 graus no sentido horário: (x, y) -> (y, -x) -- CUIDADO AQUI! Y aumenta para baixo no canvas
        // Rotação matemática padrão 90 graus horário: (x, y) -> (y, -x)
        // Rotação em sistema de coordenadas de tela (Y para baixo): (x, y) -> (-y, x)
        // A fórmula correta depende da escolha do pivô e da representação.
        // Tentativa: (x, y) -> (-y, x) relativo ao pivô
        let rotatedX = -relY;
        let rotatedY = relX;

        // Translada de volta para a posição correta
        return {
            x: center.x + rotatedX,
            y: center.y + rotatedY
        };
    });

    // Tenta aplicar "Wall Kick" (deslocamento) se a rotação colidir
    const kicks = [
        { x: 0, y: 0 },   // Tentativa 0: Sem deslocamento
        { x: -1, y: 0 },  // Tentativa 1: Esquerda
        { x: 1, y: 0 },   // Tentativa 2: Direita
        { x: 0, y: -1 }, // Tentativa 3: Cima (menos comum, mas possível)
        { x: -2, y: 0 }, // Tentativas mais distantes se necessário
        { x: 2, y: 0 },
    ];

    for (const kick of kicks) {
        const finalPosition = rotatedPoints.map(p => ({
             x: p.x + kick.x,
             y: p.y + kick.y
        }));

        if (!checkCollision(finalPosition)) {
            // Rotação válida encontrada com este deslocamento
            activeForm.points = finalPosition;
            activeForm.modification = (activeForm.modification + 1) % 4; // Atualiza estado de rotação
            return; // Sai da função após rotacionar com sucesso
        }
    }

    // Se nenhum deslocamento funcionou, a rotação falhou, reverte para o original (embora nada tenha sido mudado ainda)
    // Nenhuma ação necessária aqui, activeForm.points não foi modificado.
}


/**
 * Atualiza as estatísticas do jogo (pontuação, linhas, nível).
 * @param {number} linesCleared - Número de linhas limpas nesta jogada.
 */
function updateStats(linesCleared) {
    // Pontuação baseada no número de linhas e nível atual
    const scoreMultipliers = { 1: 40, 2: 100, 3: 300, 4: 1200 };
    score += (scoreMultipliers[linesCleared] || 0) * (level + 1);

    lines += linesCleared;

    // Calcula o novo nível (a cada 10 linhas)
    const newLevel = Math.floor(lines / 10);
    if (newLevel > level) {
        level = newLevel;
        // Aumenta a velocidade (diminui o intervalo)
        basicVelocity = Math.max(100, 480 - level * 30); // Reduz o intervalo, com um mínimo
        // Nota: timeInterval será atualizado no loop principal se não estiver no modo rápido
        // timeInterval = basicVelocity; // Atualiza imediatamente se desejado
    }

    // Atualiza os displays na tela
    levelDisplay.textContent = level;
    scoreDisplay.textContent = score;
    linesDisplay.textContent = lines;
}


// --- Controle do Estado do Jogo ---

/**
 * Pausa ou continua o jogo.
 */
function togglePause() {
    paused = !paused;
    if (paused) {
        pauseButton.textContent = "Continuar";
        pauseButton.classList.add('paused'); // Adiciona classe para estilo diferente
        if (audio) audio.pause();
        // Opcional: Mostrar um indicador visual de pausa na tela
        // context.fillStyle = "rgba(0, 0, 0, 0.5)";
        // context.fillRect(0, 0, canvas.width, canvas.height);
        // context.font = "30px Orbitron";
        // context.fillStyle = "var(--neon-yellow)";
        // context.textAlign = "center";
        // context.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
    } else {
        pauseButton.textContent = "Pausar";
        pauseButton.classList.remove('paused'); // Remove a classe
        if (audio) audio.play();
        // Reinicia o loop principal se estava pausado
        mainLoop();
    }
}

/**
 * Reseta o estado do jogo para começar do zero.
 */
function resetGameState() {
    // Limpa tabuleiro
    for (let i = 0; i < board.length; i++) {
        board[i].fill('');
    }

    // Reseta estatísticas
    level = 0;
    score = 0;
    lines = 0;
    updateStats(0); // Atualiza display para 0

    // Reseta velocidade
    basicVelocity = 480;
    timeInterval = basicVelocity;

    // Reseta estado
    paused = false;
    gameOverState = false; // Importante resetar o estado de game over
    pauseButton.textContent = "Pausar";
    pauseButton.classList.remove('paused');

    // Esconde/Mostra botões apropriados
    gameDiv.style.display = 'flex'; // Garante que a área de jogo esteja visível
    formDiv.style.display = 'none';
    retryButton.style.display = 'none';
    resetButton.style.display = 'inline-block'; // Ou 'block' se for vertical
    pauseButton.style.display = 'inline-block'; // Ou 'block'

    // Cria a primeira peça
    nextForm = getRandomInt(0, 6); // Define a próxima antes de construir
    buildNewForm(); // Constroi a peça inicial

    // Reinicia o áudio
    if (audio) {
         audio.pause();
         audio.currentTime = 0;
         audio.play();
     }

    // Garante que o loop reinicie (se não estiver já rodando ou pausado)
     // Se houver um timeout pendente, cancela antes de iniciar novo
    // (Implementação de cancelamento de timeout seria mais robusta aqui)
    if(!paused) {
         // Idealmente, gerenciar o ID do timeout para poder cancelá-lo
         // clearTimeout(timeoutId);
         mainLoop(); // Reinicia o loop
    }
}

/**
 * Inicia um novo jogo a partir do botão 'Novo Jogo'.
 */
function startNewGame() {
    resetGameState(); // Simplesmente reseta tudo
}
/**
* Inicia um novo jogo a partir do formulário.
*/
function startNewGameFromForm() {
    formDiv.style.display = 'none'; // Esconde o formulário
    gameDiv.style.display = 'flex';  // Mostra a área do jogo
    resetGameState();              // Reseta o estado e inicia
}


/**
 * Verifica se o jogo terminou (bloco alcançou o topo).
 * Esta é uma verificação simples; uma colisão ao gerar nova peça é mais precisa.
 * @returns {boolean} - True se o jogo acabou, false caso contrário.
 */
function checkGameOverCondition() {
    // Verifica se algum bloco está na linha de buffer superior (linha 0 ou 1)
    // A linha 0 e 1 são buffer, blocos fixos ali indicam game over.
    for (let x = 0; x < width; x++) {
        if (board[0][x] !== '' || board[1][x] !== '') {
            return true; // Game over
        }
    }
    return false; // Jogo continua
}


/**
 * Ativa o estado de Game Over.
 */
function triggerGameOver() {
    if (gameOverState) return; // Previne chamadas múltiplas

    gameOverState = true;
    if (audio) audio.pause();
    console.log("Game Over!"); // Log no console

    // Mostra a mensagem de Game Over no Canvas (opcional, pois vamos mudar para o form)
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "bold 28px Orbitron";
    context.fillStyle = "var(--neon-pink)";
    context.textAlign = "center";
    context.fillText("Fim de Jogo!", canvas.width / 2, canvas.height / 2 - 20);
    context.font = "16px 'Segoe UI', sans-serif";
    context.fillStyle = "var(--text-color)";
    context.fillText(`Pontos: ${score}`, canvas.width / 2, canvas.height / 2 + 15);


    // Após um curto delay, esconde o jogo e mostra o formulário
    setTimeout(() => {
        gameDiv.style.display = 'none';
        formDiv.style.display = 'flex'; // Usar flex para o estilo do form
        scoreField.value = score; // Preenche a pontuação no formulário
        // Esconde botões de controle normais que não fazem sentido agora
        resetButton.style.display = 'none';
        pauseButton.style.display = 'none';
        // O botão "Novo Jogo" (retryButton) pode ser mostrado aqui ou só após submeter
        // retryButton.style.display = 'inline-block'; // Ou pode usar o botão playAgainButton
    }, 2000); // Delay de 2 segundos
}


// --- Manipuladores de Eventos de Teclado ---

/**
 * Processa eventos de tecla pressionada.
 * @param {Event} event - O objeto do evento keydown.
 */
function handleKeyDown(event) {
    if (paused || gameOverState) return; // Ignora input se pausado ou game over

    switch (event.key) {
        case "ArrowDown":
            // Acelera a queda (reduz o intervalo do timer)
             if (timeInterval === basicVelocity) { // Só acelera se não já estiver acelerado
                 timeInterval = Math.max(50, basicVelocity / 4); // Reduz drasticamente, mínimo 50ms
             }
             // Move imediatamente um passo para baixo também
             moveActiveForm(0, 1);
             drawBoard(); // Redesenha imediatamente
            break;
        case "ArrowRight":
            xDirection = 1; // Define a direção para o próximo tick do loop
             // Move imediatamente se a resposta for desejada mais rápida
             moveActiveForm(xDirection, 0);
             xDirection = 0; // Reseta para não repetir no próximo loop sem tecla
             drawBoard(); // Redesenha imediatamente
            break;
        case "ArrowLeft":
            xDirection = -1; // Define a direção
             // Move imediatamente
             moveActiveForm(xDirection, 0);
             xDirection = 0; // Reseta
             drawBoard(); // Redesenha imediatamente
            break;
        case " ": // Barra de Espaço
        case "ArrowUp": // Seta para Cima também rotaciona
            rotateActiveForm();
            drawBoard(); // Redesenha imediatamente após rotacionar
            break;
        case "p": // Tecla 'P' para Pausar/Continuar
        case "P":
            togglePause();
            break;
    }
}

/**
 * Processa eventos de tecla liberada.
 * @param {Event} event - O objeto do evento keyup.
 */
function handleKeyUp(event) {
     if (paused || gameOverState) return;

    switch (event.key) {
        case "ArrowDown":
            // Retorna à velocidade normal de queda
             timeInterval = basicVelocity;
            break;
         // As direções esquerda/direita já são resetadas no handleKeyDown
         // após o movimento imediato, então não precisamos fazer nada aqui
         // case "ArrowRight":
         // case "ArrowLeft":
         //     xDirection = 0;
         //     break;
    }
}


// --- Loop Principal do Jogo ---
let mainLoopTimeoutId = null; // Para controlar o timeout

function mainLoop() {
    if (paused || gameOverState) {
        return; // Sai do loop se pausado ou fim de jogo
    }

    // Limpa o timeout anterior para evitar múltiplos loops rodando
    if (mainLoopTimeoutId) {
        clearTimeout(mainLoopTimeoutId);
    }

    // 1. Lógica de Queda Automática
    moveActiveForm(0, 1); // Tenta mover para baixo

    // 2. Redesenha o tabuleiro e a peça
    if (!gameOverState) { // Só desenha se o jogo não acabou neste ciclo
        drawBoard();
    }


    // 3. Agenda a próxima execução do loop
    // Se o jogo acabou durante o moveActiveForm, não agenda mais
    if (!gameOverState) {
        mainLoopTimeoutId = setTimeout(mainLoop, timeInterval);
    }
}


// --- Inicialização ---

/**
 * Configura o estado inicial e inicia o jogo.
 */
function initializeGame() {
    console.log("Iniciando Tetris...");
    updateStats(0); // Define os displays iniciais (0)
    drawNextFormPreview(nextForm); // Desenha a primeira "próxima peça"
    buildNewForm(); // Cria a peça inicial que começa a cair
    if (audio) audio.play().catch(e => console.error("Erro ao iniciar áudio:", e)); // Toca música
    else console.warn("Componente de áudio não inicializado.");
    mainLoop(); // Inicia o loop principal do jogo

    // Atualiza o ano no rodapé
    const currentYearSpan = document.getElementById('current-year');
    if(currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
}

// Inicia o jogo quando o script é carregado e o DOM está pronto
// O 'defer' no script tag ajuda, mas DOMContentLoaded é mais seguro
document.addEventListener('DOMContentLoaded', initializeGame);