class Sudoku {
    constructor() {
        this.grid = document.querySelector('.sudoku-grid');
        this.checkBtn = document.getElementById('check');
        this.resetBtn = document.getElementById('new-game');
        this.solution = this.generateSolution();
        this.init();
    }

    generateSolution() {
        const board = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.solveSudoku(board);
        return board;
    }

    solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let num of numbers) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    isValid(board, row, col, num) {
        // 检查行
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num && i !== col) return false;
        }
        
        // 检查列
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num && i !== row) return false;
        }
        
        // 检查3x3宫格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (board[i][j] === num && i !== row && j !== col) return false;
            }
        }
        
        return true;
    }

    init() {
        this.createGrid();
        this.addEventListeners();
    }

    createGrid() {
        this.grid.innerHTML = '';
        const puzzle = this.generatePuzzle();
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cell';
                input.maxLength = 1;
                
                // 设置边框样式
                if (i % 3 === 0) input.classList.add('border-top');
                if (i === 8) input.classList.add('border-bottom');
                if (j % 3 === 0) input.classList.add('border-left');
                if (j === 8) input.classList.add('border-right');

                // 设置初始数字
                if (puzzle[i][j] !== 0) {
                    input.value = puzzle[i][j];
                    input.readOnly = true;
                    input.classList.add('fixed');
                }

                // 添加输入验证
                input.addEventListener('input', (e) => {
                    const value = e.target.value;
                    if (!/^[1-9]$/.test(value)) {
                        e.target.value = '';
                    }
                });

                // 添加键盘导航
                input.addEventListener('keydown', (e) => {
                    this.handleKeyNavigation(e, i, j);
                });

                this.grid.appendChild(input);
            }
        }
    }

    generatePuzzle() {
        // 从完整解中随机移除一些数字
        const puzzle = this.solution.map(row => [...row]);
        const cellsToRemove = this.cellsToRemove || 40; // 默认移除40个数字
        
        // 确保移除的数字不会导致多解
        let removed = 0;
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (puzzle[row][col] !== 0) {
                // 保存当前值
                const backup = puzzle[row][col];
                puzzle[row][col] = 0;
                
                // 检查是否仍然有唯一解
                const tempBoard = puzzle.map(row => [...row]);
                if (this.countSolutions(tempBoard) === 1) {
                    removed++;
                } else {
                    // 恢复值
                    puzzle[row][col] = backup;
                }
            }
        }
        
        return puzzle;
    }

    countSolutions(board) {
        let count = 0;
        
        const solve = (board) => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === 0) {
                        for (let num = 1; num <= 9; num++) {
                            if (this.isValid(board, row, col, num)) {
                                board[row][col] = num;
                                if (solve(board)) {
                                    if (count > 1) return; // 提前退出
                                    count++;
                                }
                                board[row][col] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        }
        
        solve(board);
        return count;
    }

    handleKeyNavigation(e, row, col) {
        const cells = this.grid.querySelectorAll('.cell');
        const currentIndex = row * 9 + col;

        switch(e.key) {
            case 'ArrowLeft':
                if (col > 0) cells[currentIndex - 1].focus();
                break;
            case 'ArrowRight':
                if (col < 8) cells[currentIndex + 1].focus();
                break;
            case 'ArrowUp':
                if (row > 0) cells[currentIndex - 9].focus();
                break;
            case 'ArrowDown':
                if (row < 8) cells[currentIndex + 9].focus();
                break;
        }
    }

    addEventListeners() {
        console.log('初始化事件监听器...');
        
        // 重置按钮
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                console.log('点击重置按钮');
                this.resetGame();
            });
        } else {
            console.error('找不到重置按钮');
        }

        // 检查按钮
        if (this.checkBtn) {
            this.checkBtn.addEventListener('click', () => {
                console.log('点击检查按钮');
                this.checkSolution();
            });
        } else {
            console.error('找不到检查按钮');
        }

        // 难度选择
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                console.log('更改难度:', e.target.value);
                this.setDifficulty(e.target.value);
                this.resetGame();
            });
        } else {
            console.error('找不到难度选择器');
        }
        
        // 初始化计时器
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        console.log('计时器已启动');
    }

    resetGame() {
        this.solution = this.generateSolution();
        this.createGrid();
        
        // Reset timer
        this.startTime = Date.now();
        document.getElementById('timer').textContent = '00:00';
    }

    setDifficulty(level) {
        this.difficulty = level;
        switch(level) {
            case 'easy':
                this.cellsToRemove = 30;
                break;
            case 'medium':
                this.cellsToRemove = 40;
                break;
            case 'hard':
                this.cellsToRemove = 50;
                break;
            default:
                this.cellsToRemove = 40;
        }
    }

    updateTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }

    checkSolution() {
        const cells = Array.from(this.grid.querySelectorAll('.cell'));
        const resultDiv = document.getElementById('message');
        
        if (!resultDiv) {
            alert('找不到结果展示区域');
            return;
        }

        // 检查是否所有单元格都已填写
        const isComplete = cells.every(cell => cell.value);
        if (!isComplete) {
            resultDiv.innerHTML = `
                <div class="result-content">
                    <p>请填完所有空格！</p>
                </div>
            `;
            resultDiv.style.display = 'block';
            return;
        }

        // 转换为二维数组
        const board = [];
        for (let i = 0; i < 9; i++) {
            const row = [];
            for (let j = 0; j < 9; j++) {
                const num = parseInt(cells[i * 9 + j].value);
                if (isNaN(num) || num < 1 || num > 9) {
                    resultDiv.innerHTML = `
                        <div class="result-content">
                            <p>第${i+1}行第${j+1}列的值无效，请输入1-9的数字！</p>
                        </div>
                    `;
                    resultDiv.style.display = 'block';
                    return;
                }
                row.push(num);
            }
            board.push(row);
        }

        // 验证答案
        if (this.isValidSolution(board) && this.compareWithSolution(board)) {
            resultDiv.innerHTML = `
                <div class="result-content">
                    <p>恭喜你 答案正确，请开始新游戏</p>
                    <button id="next-level">开始新游戏</button>
                </div>
            `;
            resultDiv.style.display = 'block';
            
            // 绑定下一关按钮事件
            const nextLevelBtn = document.getElementById('next-level');
            if (nextLevelBtn) {
                nextLevelBtn.addEventListener('click', () => {
                    resultDiv.style.display = 'none';
                    this.resetGame();
                });
            }
        } else {
            resultDiv.innerHTML = `
                <div class="result-content">
                    <p>答案有误 请检查</p>
                </div>
            `;
            resultDiv.style.display = 'block';
        }
    }

    compareWithSolution(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] !== this.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    isValidSolution(board) {
        console.log('开始验证数独解...');
        
        // 检查每一行
        for (let i = 0; i < 9; i++) {
            const rowNums = new Set();
            for (let j = 0; j < 9; j++) {
                const num = board[i][j];
                if (num < 1 || num > 9) {
                    console.error(`第${i+1}行第${j+1}列的值超出范围：${num}`);
                    return false;
                }
                if (rowNums.has(num)) {
                    console.error(`第${i+1}行有重复数字：${num}`);
                    return false;
                }
                rowNums.add(num);
            }
        }
    
        // 检查每一列
        for (let j = 0; j < 9; j++) {
            const colNums = new Set();
            for (let i = 0; i < 9; i++) {
                const num = board[i][j];
                if (num < 1 || num > 9) {
                    console.error(`第${i+1}行第${j+1}列的值超出范围：${num}`);
                    return false;
                }
                if (colNums.has(num)) {
                    console.error(`第${j+1}列有重复数字：${num}`);
                    return false;
                }
                colNums.add(num);
            }
        }
    
        // 检查每个3x3方格
        for (let block = 0; block < 9; block++) {
            const boxNums = new Set();
            const rowStart = Math.floor(block / 3) * 3;
            const colStart = (block % 3) * 3;
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const num = board[rowStart + i][colStart + j];
                    if (num < 1 || num > 9) {
                        console.error(`第${rowStart + i + 1}行第${colStart + j + 1}列的值超出范围：${num}`);
                        return false;
                    }
                    if (boxNums.has(num)) {
                        console.error(`第${Math.floor(block / 3) + 1}行第${(block % 3) + 1}个宫格有重复数字：${num}`);
                        return false;
                    }
                    boxNums.add(num);
                }
            }
        }
    
        console.log('数独解验证通过');
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Sudoku();
});
