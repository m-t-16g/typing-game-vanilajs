"use strict";
const HTMLscore = document.getElementById("score");
const HTMLtime = document.getElementById("time");
const MainText = document.getElementById("main");
const DialogueCountdown = document.getElementById("countdown");
const DialogueWindow = document.getElementById("dialogue");
const dialogue = {
    open: function () {
        DialogueWindow.classList.remove("hidden");
    },
    close: function () {
        DialogueWindow.classList.add("hidden");
    },
};

class Game {
    score;
    timeRemain;
    setScore(score) {
        this.score = score;
    }
    setTimer(time) {
        this.timeRemain = time;
    }
    start() {}
}
// class dialogue {
//     open() {
//         DialogueWindow.classList.remove("hidden");
//     }
//     close() {
//         DialogueWindow.classList.add("hidden");
//     }
// }
// dialogue = new dialogue();
// dialogue.open();
function countdown(num) {
    const time = [parseInt(num), 0];
    DialogueCountdown.textContent = time[0];
    dialogue.open();
    const setTimer = setInterval(changeText, 1000);
    function changeText() {
        time[0]--;
        if (time[0] > time[1]) {
            DialogueCountdown.textContent = time[0];
        } else {
            DialogueCountdown.textContent = "start";
            setTimeout(() => {
                dialogue.close();
                gameTimer(10);
            }, 500);
            clearInterval(setTimer);
        }
    }
}
function gameTimer(num) {
    const timeRemain = [parseInt(num), 0];
    HTMLtime.textContent = timeRemain[0];
    const gameInterval = setInterval(inGameTimer, 1000);
    function inGameTimer() {
        timeRemain[0]--;
        if (timeRemain[0] >= timeRemain[1]) {
            HTMLtime.textContent = timeRemain[0];
        } else {
            clearInterval(gameInterval);
        }
    }
}

// キー操作のアクション
function keydown(button) {
    console.log(button);
    if (button.key == " ") {
        countdown(3);
    }
}
window.addEventListener("keydown", gameMain);
// 問題文と判定
const target = ["t", "e", "s", "t"];
function createText(text) {
    if (MainText.hasChildNodes) {
        while (MainText.firstChild) {
            MainText.removeChild(MainText.firstChild);
        }
    }
    text.forEach((letter) => {
        const letterNodes = document.createElement("span");
        letterNodes.classList.add("mx-0.5");
        letterNodes.classList.add("text-white");
        letterNodes.classList.add("q");
        letterNodes.textContent = letter;
        MainText.append(letterNodes);
    });
}
function gameMain(e) {
    const key = e.key;
    const question = document.querySelector(".q");
    console.log(question);
    if (question) {
        if (key == question.textContent) {
            console.log(key);
            question.classList.remove("text-white");
            question.classList.add("text-indigo-800");
            question.classList.remove("q");
            if (!document.querySelector(".q")) {
                setTimeout(createText, 100, target);
            }
        }
    }
}

// カウントダウン開始
// countdown(3);
// gameTimer(10);
// createText(target);
