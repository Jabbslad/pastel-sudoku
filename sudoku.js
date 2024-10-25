class SudokuGame {
  constructor() {
    this.board = Array(9)
      .fill()
      .map(() => Array(9).fill(0));
    this.solution = Array(9)
      .fill()
      .map(() => Array(9).fill(0));
    this.initial = Array(9)
      .fill()
      .map(() => Array(9).fill(false));
    this.selectedCell = null;
    this.timer = null;
    this.seconds = 0;
    this.difficulty = "medium";
    this.mistakes = 0;
    this.hintsRemaining = 3;

    this.initializeDOM();
    this.bindEvents();
    this.newGame();
  }

  initializeDOM() {
    this.boardElement = document.getElementById("board");
    this.timeElement = document.getElementById("time");
    this.createBoard();
  }

  bindEvents() {
    document
      .getElementById("newGame")
      .addEventListener("click", () => this.newGame());
    document
      .getElementById("check")
      .addEventListener("click", () => this.checkSolution());
    document
      .getElementById("hint")
      .addEventListener("click", () => this.getHint());

    document.getElementById("numberPad").addEventListener("click", (e) => {
      if (e.target.classList.contains("number-btn")) {
        const number = parseInt(e.target.dataset.number);
        this.setNumber(number);
      }
    });

    // Add keyboard support
    document.addEventListener("keydown", (e) => {
      if (e.key >= "1" && e.key <= "9") {
        this.setNumber(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        this.setNumber(0);
      }
    });
  }

  createBoard() {
    this.boardElement.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = i;
        cell.dataset.col = j;
        cell.addEventListener("click", () => this.selectCell(cell, i, j));
        this.boardElement.appendChild(cell);
      }
    }
  }

  selectCell(cell, row, col) {
    // Remove previous selection
    if (this.selectedCell) {
      this.selectedCell.classList.remove("selected");
      this.clearHighlights();
    }

    // Select new cell
    this.selectedCell = cell;
    cell.classList.add("selected");

    // Highlight same numbers and related cells
    this.highlightRelatedCells(row, col);
  }

  highlightRelatedCells(row, col) {
    const value = this.board[row][col];
    const cells = document.getElementsByClassName("cell");

    // Highlight same row, column, and box
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const cell = cells[i * 9 + j];
        // Same row or column
        if (i === row || j === col) {
          cell.classList.add("highlight-box");
        }
        // Same 3x3 box
        if (
          Math.floor(i / 3) === Math.floor(row / 3) &&
          Math.floor(j / 3) === Math.floor(col / 3)
        ) {
          cell.classList.add("highlight-box");
        }
        // Same number
        if (value !== 0 && this.board[i][j] === value) {
          cell.classList.add("same-number");
        }
      }
    }
  }

  clearHighlights() {
    const cells = document.getElementsByClassName("cell");
    Array.from(cells).forEach((cell) => {
      cell.classList.remove("highlight-box", "same-number");
    });
  }

  setNumber(num) {
    if (
      !this.selectedCell ||
      this.initial[this.selectedCell.dataset.row][this.selectedCell.dataset.col]
    ) {
      return;
    }

    const row = parseInt(this.selectedCell.dataset.row);
    const col = parseInt(this.selectedCell.dataset.col);

    // Clear number if same number is clicked
    if (this.board[row][col] === num) {
      num = 0;
    }

    this.board[row][col] = num;
    this.updateDisplay();
    this.highlightRelatedCells(row, col);

    // Check if puzzle is completed
    if (this.isBoardFull() && this.isCorrect()) {
      this.showSuccess();
    }
  }

  updateDisplay() {
    const cells = document.getElementsByClassName("cell");
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const cell = cells[i * 9 + j];
        const value = this.board[i][j];

        cell.textContent = value || "";
        cell.classList.toggle("initial", this.initial[i][j]);

        if (value !== 0 && !this.isValidMove(i, j, value)) {
          cell.classList.add("error");
        } else {
          cell.classList.remove("error");
        }
      }
    }
  }

  generatePuzzle() {
    // Clear the board
    this.board = Array(9)
      .fill()
      .map(() => Array(9).fill(0));
    this.solution = Array(9)
      .fill()
      .map(() => Array(9).fill(0));

    // Generate a solved board
    this.solveSudoku(this.solution);

    // Copy solution to playing board
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.board[i][j] = this.solution[i][j];
      }
    }

    // Remove numbers based on difficulty
    const cellsToRemove = {
      easy: 35,
      medium: 45,
      hard: 55,
    }[this.difficulty];

    for (let i = 0; i < cellsToRemove; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * 9);
        col = Math.floor(Math.random() * 9);
      } while (this.board[row][col] === 0);

      this.board[row][col] = 0;
    }

    // Mark initial numbers
    this.initial = Array(9)
      .fill()
      .map(() => Array(9).fill(false));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.initial[i][j] = this.board[i][j] !== 0;
      }
    }
  }

  solveSudoku(board) {
    const empty = this.findEmpty(board);
    if (!empty) return true;

    const [row, col] = empty;
    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of numbers) {
      if (this.isValid(board, row, col, num)) {
        board[row][col] = num;
        if (this.solveSudoku(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  findEmpty(board) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return [i, j];
      }
    }
    return null;
  }

  isValid(board, row, col, num) {
    // Check row
    for (let j = 0; j < 9; j++) {
      if (board[row][j] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }

    return true;
  }

  isValidMove(row, col, num) {
    const temp = this.board[row][col];
    this.board[row][col] = 0;
    const valid = this.isValid(this.board, row, col, num);
    this.board[row][col] = temp;
    return valid;
  }

  isBoardFull() {
    return !this.board.some((row) => row.includes(0));
  }

  isCorrect() {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.board[i][j] !== this.solution[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  checkSolution() {
    let isCorrect = true;
    const cells = document.getElementsByClassName("cell");

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (
          this.board[i][j] !== 0 &&
          this.board[i][j] !== this.solution[i][j]
        ) {
          cells[i * 9 + j].classList.add("error");
          isCorrect = false;
        }
      }
    }

    if (isCorrect && this.isBoardFull()) {
      this.showSuccess();
    }
  }

  getHint() {
    if (this.hintsRemaining <= 0) return;

    if (this.selectedCell) {
      const row = parseInt(this.selectedCell.dataset.row);
      const col = parseInt(this.selectedCell.dataset.col);

      if (!this.initial[row][col]) {
        this.board[row][col] = this.solution[row][col];
        this.selectedCell.classList.add("animate");
        setTimeout(() => this.selectedCell.classList.remove("animate"), 300);
        this.hintsRemaining--;
        this.updateDisplay();
      }
    }
  }

  showSuccess() {
    clearInterval(this.timer);
    const message = document.createElement("div");
    message.className = "success-message animate__animated animate__fadeInUp";
    message.textContent = `Congratulations! Time: ${this.formatTime(this.seconds)}`;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  }

  startTimer() {
    this.seconds = 0;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.seconds++;
      this.timeElement.textContent = this.formatTime(this.seconds);
    }, 1000);
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  newGame() {
    this.generatePuzzle();
    this.updateDisplay();
    this.startTimer();
    this.hintsRemaining = 3;
    this.mistakes = 0;

    if (this.selectedCell) {
      this.selectedCell.classList.remove("selected");
      this.selectedCell = null;
    }
    this.clearHighlights();
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new SudokuGame();
});
