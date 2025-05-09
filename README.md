# GΞΞK CΦDΞ Tetris

<p align="center"><img alt="GΞΞK CΦDΞ Tetris screenshot" src="assets/images/screenshot_tetris.png"></p>

## Descrição

Este projeto é uma implementação web do clássico jogo Tetris, desenvolvido por GΞΞK CΦDΞ. O jogo desafia os jogadores a encaixar tetraminós que caem para formar linhas horizontais completas, que são então eliminadas. Conforme o jogador avança, a velocidade aumenta. O jogo inclui um sistema de pontuação, níveis de dificuldade progressivos e um placar de recordes (high scores) que utiliza PHP e um banco de dados MySQL para armazenar e exibir as melhores pontuações.

## Funcionalidades

* **Jogabilidade Clássica de Tetris:** Movimente e rotacione os tetraminós que caem para completar linhas.
* **Painel de Informações:** Exibe o Nível atual, Pontos e Linhas completadas.
* **Visualização da Próxima Peça:** Permite que o jogador se prepare para o próximo tetraminó.
* **Sistema de Pontuação:**
    * Ganhe pontos ao completar linhas.
    * A pontuação é multiplicada pelo nível atual (Nível + 1).
    * Pontos por linhas: 1 linha = 40 pts, 2 linhas = 100 pts, 3 linhas = 300 pts, 4 linhas (Tetris) = 1200 pts.
* **Níveis Progressivos:** O nível aumenta a cada 10 linhas completadas, e a velocidade de queda das peças também aumenta.
* **Controles do Jogo:**
    * **Setas ⬅️ e ➡️:** Mover a peça para a esquerda ou direita.
    * **Seta ⬇️:** Acelerar a queda da peça (soft drop).
    * **Seta ⬆️ ou Barra de Espaço:** Rotacionar a peça.
    * **Tecla 'P':** Pausar/Continuar o jogo.
* **Botões de Controle:**
    * **Pausar/Continuar:** Interrompe ou retoma o jogo.
    * **Resetar:** Reinicia o jogo do zero.
    * **Novo Jogo:** (Disponível após o fim de jogo) Inicia uma nova partida.
* **Fim de Jogo (Game Over):**
    * Ocorre quando as peças se acumulam até o topo do tabuleiro.
    * Exibe a pontuação final e um formulário para registrar o nome do jogador.
* **Sistema de High Scores:**
    * Após o fim do jogo, o jogador pode submeter seu nome e pontuação.
    * Os dados são enviados para um script PHP (`store_score.php`) que os armazena em um banco de dados MySQL.
    * Um script PHP (`show_highscore.php`) exibe os 10 melhores recordes (esta página não está diretamente linkada na interface do jogo, mas os scripts existem).
* **Trilha Sonora:** Música tema do Tetris durante o jogo (referenciada em `assets/sound/tetris_soundtrack.mp3`).
* **Design Responsivo:** Interface se adapta a diferentes tamanhos de tela.
* **Tema Visual:** Estilo "Dracula/Neon" com fontes como Orbitron.

## Tecnologias Utilizadas

* **HTML5:** Estrutura da página do jogo, incluindo o canvas e os elementos de interface.
* **CSS3:** Estilização completa do jogo, utilizando variáveis CSS, Flexbox para layout e media queries para responsividade.
* **JavaScript (ES6+):** Toda a lógica do jogo, incluindo:
    * Renderização no Canvas 2D.
    * Movimentação e rotação de peças.
    * Detecção de colisão.
    * Lógica de limpeza de linhas.
    * Gerenciamento de pontuação, níveis e velocidade.
    * Controle de estado do jogo (pausa, game over).
    * Manipulação do DOM para interface e formulário.
    * Controle de áudio.
* **PHP:** Para o backend do sistema de high scores.
    * `store_score.php`: Recebe dados do formulário e insere no banco de dados.
    * `show_highscore.php`: Consulta o banco de dados e exibe os recordes.
* **MySQL (ou compatível):** Banco de dados para armazenar os high scores (nome e pontuação).

## Como Jogar

1.  **Iniciar:** A página carrega e o jogo começa automaticamente.
2.  **Movimentar Peças:**
    * Use as **setas direcionais esquerda (⬅️) e direita (➡️)** para mover a peça lateralmente.
    * Use a **seta direcional para baixo (⬇️)** para acelerar a queda da peça (soft drop).
3.  **Rotacionar Peças:**
    * Use a **seta direcional para cima (⬆️)** ou a **Barra de Espaço** para rotacionar a peça no sentido horário.
4.  **Objetivo:**
    * Encaixe as peças de forma a completar linhas horizontais.
    * Linhas completas desaparecem, e as peças acima descem.
    * O jogo termina se as peças se acumularem até o topo do tabuleiro.
5.  **Pausar/Resetar:**
    * Clique no botão "Pausar" para interromper o jogo. Clique novamente para "Continuar".
    * Clique no botão "Resetar" para reiniciar a partida a qualquer momento.
6.  **Pontuação e Níveis:**
    * Ganhe pontos por cada linha completada. Fazer um "Tetris" (4 linhas de uma vez) concede mais pontos.
    * A cada 10 linhas, o nível aumenta e as peças caem mais rápido.
7.  **Fim de Jogo e High Score:**
    * Ao final da partida, sua pontuação será exibida.
    * Você pode inserir seu nome e clicar em "Enviar" para registrar seu recorde.
    * Clique em "Jogar Novamente" para iniciar uma nova partida.

## Arquivos Incluídos

* `index.html`: Arquivo principal HTML que estrutura a página do jogo.
* `style.css`: Contém todos os estilos CSS para a aparência do jogo.
* `script.js`: Contém toda a lógica de programação do jogo em JavaScript.
* `store_score.php`: Script PHP para salvar os recordes no banco de dados.
* `show_highscore.php`: Script PHP para exibir a lista de recordes (acessado diretamente, não linkado na interface principal do jogo).
* `assets/sound/tetris_soundtrack.mp3`: Arquivo de áudio da trilha sonora do jogo (referenciado no `script.js`).
* `assets/images/screenshot_tetris.png`: Imagem de screenshot usada neste README (referenciada no `README.md` original).

## Configuração para Funcionalidade de High Score (Backend)

Para que o sistema de high scores funcione, você precisará de:

1.  Um servidor web com suporte a PHP (ex: Apache, Nginx).
2.  Um servidor de banco de dados MySQL (ou compatível).
3.  **Configurar Credenciais:** Os scripts `store_score.php` e `show_highscore.php` contêm credenciais de banco de dados (host, usuário, senha, nome do banco) que precisam ser ajustadas para o seu ambiente.
    ```php
    $host = "localhost"; // Geralmente é localhost
    $user = "id9791891_lulu98"; // Seu usuário do banco de dados
    $password = "a1b2c3d4"; // Sua senha do banco de dados
    $database = "id9791891_luludb"; // O nome do seu banco de dados
    ```
4.  **Estrutura da Tabela:** É necessário criar uma tabela no banco de dados (presumivelmente chamada `tetris`, conforme os scripts PHP) com as seguintes colunas (ou similares):
    * `name` (VARCHAR, para o nome do jogador)
    * `score` (INT, para a pontuação)
    * (Opcional) `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
    * (Opcional) `timestamp` (TIMESTAMP, para registrar quando o score foi obtido)

    Exemplo de SQL para criar a tabela:
    ```sql
    CREATE TABLE tetris (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

## Fontes e Inspiração

* **Trilha Sonora:**
    * Tetris theme song: [https://archive.org/details/TetrisThemeMusic](https://archive.org/details/TetrisThemeMusic) (Conforme README original)

## TODO (Lista de Tarefas - do README original e observações)

* [ ] **Bugs nos Movimentos:** Corrigir bugs relacionados aos movimentos dos tetraminós (conforme README original).
* [ ] **Mensagem de 'Game Over':** Implementar a mensagem de 'Game Over' de forma mais integrada, possivelmente como um overlay sobre o canvas, em vez de esconder a área de jogo e mostrar um formulário separado imediatamente (conforme TODO no `script.js`).
* [ ] **Avaliação da Melodia:** Avaliar a melodia atual e considerar alternativas usando a Web Audio API para melhor controle (conforme TODO no `script.js`).
* [ ] **Refatoração `gameOver`:** Refatorar a função `gameOver` para maior clareza (conforme TODO no `script.js`).
* [ ] **Revisão de Bugs:** Revisar bugs conhecidos e a lógica de colisão/rotação (conforme TODO no `script.js`).
* [ ] **Link para High Scores:** Adicionar um link ou botão na interface principal para visualizar a página `show_highscore.php`.
