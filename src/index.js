import { snd, lnd, d } from './dictionary.js'
const start = new Date(2022,3, 15);
const today = new Date()
today.setMilliseconds(0);
today.setSeconds(0);
today.setMinutes(0);
today.setHours(0);
const currentDay = (today.getTime()-start.getTime())/(24*60*60*1000);


var gameIsOver = false;
var state = {
    number: currentDay,
    //number: Math.floor(Math.random() * snd.length),
    secret: snd[currentDay],
    grid: Array(8).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
};

console.log(state.secret);
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) { 
    document.documentElement.setAttribute('data-theme', currentTheme);
} else {
    document.documentElement.setAttribute('data-theme', 'dark');
}
function changeColorMode() {
    let curr = document.documentElement.getAttribute('data-theme');
    if (curr == 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}
const colorModeButton = document.getElementById("colormode");
colorModeButton.addEventListener("click", changeColorMode);
const keyboard = document.getElementsByClassName("keyboard-container")[0];
const rows = keyboard.children;
for (let i = 0; i < rows.length; i++){
    const row = rows[i]
    const keys = row.children;
    for (let j = 0; j < keys.length; j++){
        const key = keys[j];
        if (key.tagName==="BUTTON"){
            
            key.addEventListener("click",handleKeyboardEvent);
        }
    }
}
const isVisible = "is-visible";
const statsButton = document.getElementById("statsButton");
const statsModal = document.getElementById("statsModal")
statsButton.addEventListener("click", function(){
    console.log("click")
    statsModal.classList.add(isVisible);
})

const helpButton = document.getElementById("helpButton");
const helpModal = document.getElementById("helpModal")
helpButton.addEventListener("click", function(){
    console.log("click")
    helpModal.classList.add(isVisible);
})
function loadState(){
    let previousState = JSON.parse(localStorage.getItem('state'));
    if(previousState.number==currentDay){
        state.grid = previousState.grid;
        state.currentRow = previousState.currentRow;
        state.currentCol = previousState.currentCol;
        for(let i = 0; i<state.currentRow; i++){
            console.log(i)
            revealWord(getWordAtRow(i),isWordValid(getWordAtRow(i))[1],i)
        }
        //if(state.currentCol==5){
        //    console.log('cur');
        //    revealWord(getCurrentWord(),isWordValid(getCurrentWord())[1]);
        //}
        updateGrid();
    }
}
function uploadState(){
    localStorage.setItem('state',JSON.stringify(state));
}
 
document.addEventListener("click", e => {
  if (e.target == document.querySelector(".modal.is-visible")) {
    document.querySelector(".modal.is-visible").classList.remove(isVisible);
  }
});
function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`)
            box.textContent = state.grid[i][j];
            if (box.textContent == '') {
                box.classList.remove('entered')
            }
            if (isLetter(box.textContent)) {
                box.classList.add('entered')
                if (box.classList.contains('displayed')) {
                    box.classList.remove('entered')
                }
            }

        }
    }
    uploadState();
}

function drawBox(container, row, col, letter = '') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = letter;
    container.appendChild(box);
    return box;
}

function drawGrid() {
    const grid = document.getElementsByClassName('grid')[0];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j)
        }
    }
}
function registerKeyboardEvents() {
    document.body.onkeydown = handleKeyboardEvent;
}
function handleKeyboardEvent(e) {
    if(!gameIsOver){
    const key = e.key ? e.key : e.target.id.substring(3);;
    if (key === 'Enter') {
        if (state.currentCol === 5) {
            const word = getCurrentWord();
            const isValid = isWordValid(word);
            if (isValid[0]) {
                revealWord(word, isValid[1]);
                state.currentRow++;
                state.currentCol = 0;
            }
            else {
                const shook_duration = 600;
                const row = state.currentRow;
                for (let i = 0; i < 5; i++) {
                    const box = document.getElementById(`box${row}${i}`);
                    box.classList.add('shook');
                    setTimeout(() => {
                        box.classList.remove('shook');
                    }, shook_duration);
                }
            }
        }
    }
    if (key === 'Backspace') {
        removeLetter();
    }
    if (isLetter(key)) {
        addLetter(key);
    }
    updateGrid();
}
}

function getCurrentWord() {
    return state.grid[state.currentRow].reduce((prev, curr) => prev + curr).toLowerCase();
}
function getWordAtRow(row){
    return state.grid[row].reduce((prev, curr) => prev + curr).toLowerCase();
}
function isWordValid(word) {
    let isWordValidBool = lnd.includes(word);
    let isWordValidInt = lnd.findIndex(elem => elem == word);
    if(d.includes(word)){
        console.log('duplicate')
    }
    return [isWordValidBool, isWordValidInt];
}
function revealWord(guess, index, row = state.currentRow) {
    
    const flop_duration = 500;
    const bounce_duration = 250;
    const spin_duration = 1000;
    const liar = (row + index + state.number) % 10;
    const liarColour = liar % 2;
    const liarBox = (liar - liarColour) / 2
    console.log(liar, liarColour, liarBox)
    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${row}${i}`)
        const letter = state.grid[row][i];
        setTimeout(() => {
            if (letter === state.secret[i]) {
                if (i != liarBox) {
                    box.classList.add('right');
                } else {
                    box.classList.add('empty');
                }
                box.classList.remove('entered');
                box.classList.add('displayed');
            } else if (state.secret.includes(letter)) {
                if (i != liarBox) {
                    box.classList.add('wrong');
                } else {
                    box.classList.add('empty');
                } 
                box.classList.remove('entered');
                box.classList.add('displayed');
            } else {
                if (i != liarBox) {
                    box.classList.add('empty');
                } else if (liarColour == 0) {
                    box.classList.add('right');
                } else {
                    box.classList.add('wrong');
                }
                box.classList.remove('entered');
                box.classList.add('displayed');
            }
        }, (i + 1) * flop_duration / 2);
        box.classList.add('animated');
        box.style.animationDelay = `${(i * flop_duration) / 2}ms`
    }
    const isWinner = state.secret === guess;
    const isGameOver = row === 7 && !isWinner;
    gameIsOver = isWinner || isGameOver;
    setTimeout(() => {
        if (isGameOver) {
            alert(`Better luck next time! The word was ${state.secret}.`);
        }
    }, 3 * flop_duration);
    if (isWinner) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const box = document.getElementById(`box${row}${i}`);
                if (box.classList.contains('empty') || box.classList.contains('wrong')) {
                    box.classList.add('spun');
                    
                    box.classList.add('right');
                    
                    setTimeout(() => {
                        box.classList.remove('spun');
                    }, spin_duration);

                }
            }, 3 * flop_duration);
        }
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const box = document.getElementById(`box${row}${i}`)
                box.classList.add('won')
            }, ((24 * flop_duration + i * bounce_duration + 8 * spin_duration) / 8))
        }
        setTimeout(() => {
            console.log('Congratulations!')
        }, ((24 * flop_duration + 100 * bounce_duration + 8 * spin_duration) / 8))

    }
}



function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}
function addLetter(letter) {
    if (state.currentCol === 5) return;
    state.grid[state.currentRow][state.currentCol] = letter.toLowerCase();
    state.currentCol++;
}
function removeLetter() {
    if (state.currentCol === 0) return;
    state.grid[state.currentRow][state.currentCol - 1] = '';
    state.currentCol--;
}
function setup() {
    drawGrid();
    //loadState();
    registerKeyboardEvents();
}
setup();
