const board = document.getElementById('board');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const restartBtn = document.getElementById('restart-btn');
const pvpBtn = document.getElementById('pvp-btn');
const aiBtn = document.getElementById('ai-btn');
const difficultySelect = document.getElementById('difficulty');

let currentPlayer = 'X';
let gameBoard = Array(9).fill(null);
let gameActive = true;
let vsAI = true;
let difficulty = 'medium';

let scores = { X: 0, O: 0, draw: 0 };

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// Create board cells
function createBoard() {
  board.innerHTML = '';
  gameBoard.forEach((_, index) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = index;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
  });
}

function handleCellClick(e) {
  const index = parseInt(e.target.dataset.index);

  if (gameBoard[index] || !gameActive) return;

  // Player's move
  makeMove(index, currentPlayer);

  if (vsAI && gameActive && currentPlayer === 'O') {
    setTimeout(aiMove, 500); // Small delay for better UX
  }
}

function makeMove(index, player) {
  gameBoard[index] = player;
  const cells = board.querySelectorAll('.cell');
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());

  if (checkWin(player)) {
    statusText.textContent = `${player} Wins! 🎉`;
    scores[player]++;
    updateScoreboard();
    gameActive = false;
    highlightWinningLine(player);
    return;
  }

  if (gameBoard.every(cell => cell !== null)) {
    statusText.textContent = "It's a Draw! 🤝";
    scores.draw++;
    updateScoreboard();
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWin(player) {
  return winningConditions.some(condition => {
    return condition.every(index => gameBoard[index] === player);
  });
}

function highlightWinningLine(player) {
  const cells = board.querySelectorAll('.cell');
  winningConditions.forEach(condition => {
    if (condition.every(index => gameBoard[index] === player)) {
      condition.forEach(index => {
        cells[index].style.backgroundColor = '#2ecc71';
        cells[index].style.color = 'white';
      });
    }
  });
}

// AI Move using Minimax
function aiMove() {
  if (!gameActive) return;

  let bestScore = -Infinity;
  let move;

  // Easy: Random move
  if (difficulty === 'easy') {
    const availableMoves = gameBoard.map((val, idx) => val === null ? idx : null).filter(v => v !== null);
    move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  } 
  // Medium & Hard: Use Minimax with depth limit
  else {
    for (let i = 0; i < 9; i++) {
      if (!gameBoard[i]) {
        gameBoard[i] = 'O';
        let score = minimax(gameBoard, 0, false);
        gameBoard[i] = null;

        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
  }

  if (move !== undefined) {
    makeMove(move, 'O');
  }
}

// Minimax Algorithm (Core AI Logic)
function minimax(newBoard, depth, isMaximizing) {
  if (checkWin('O')) return 10 - depth;
  if (checkWin('X')) return depth - 10;
  if (newBoard.every(cell => cell !== null)) return 0;

  // Medium difficulty: limit depth
  if (difficulty === 'medium' && depth > 3) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = 'O';
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = 'X';
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function updateScoreboard() {
  document.getElementById('score-x').textContent = scores.X;
  document.getElementById('score-o').textContent = scores.O;
  document.getElementById('score-draw').textContent = scores.draw;
}

function resetGame() {
  gameBoard = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  statusText.textContent = "Player X's turn";
  createBoard();
}

function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
}

// Event Listeners
pvpBtn.addEventListener('click', () => {
  vsAI = false;
  pvpBtn.classList.add('active');
  aiBtn.classList.remove('active');
  resetGame();
});

aiBtn.addEventListener('click', () => {
  vsAI = true;
  aiBtn.classList.add('active');
  pvpBtn.classList.remove('active');
  resetGame();
});

difficultySelect.addEventListener('change', (e) => {
  difficulty = e.target.value;
  if (vsAI) resetGame();
});

resetBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', () => {
  resetScores();
  resetGame();
});

// Initialize game
createBoard();
statusText.textContent = "Player X's turn (You are X)";