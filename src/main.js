"use strict";
const HTMLscore = document.getElementById("score");
const HTMLtime = document.getElementById("time");
const MainText = document.getElementById("main");
const DialogueCountdown = document.getElementById("countdown");
const DialogueWindow = document.getElementById("dialogue");
const ReplayButton = document.getElementById("replaybutton");
const apiUrl = "https://random-word-api.herokuapp.com/word?number=1";
// 外部 API からランダムな英単語を取得して返す関数
function getRandomWord() {
    return new Promise((resolve, reject) => {
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const word = data[0];
                resolve(word.split("")); // 取得した単語を解決する
            })
            .catch((error) => {
                console.error("Error fetching random word:", error);
                reject(error); // エラーを拒否する
            });
    });
}
// カウントダウン等を表示する領域を開いたり閉じたり
const dialogue = {
    open: function () {
        DialogueWindow.classList.remove("hidden");
    },
    close: function () {
        DialogueWindow.classList.add("hidden");
    },
};
// ランダム文字列を生成するための定数とメソッド
const letters = "abcdefghijklmnopqrstuvwxyz";
const random = {
    number: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    char: function () {
        return letters[Math.floor(Math.random() * letters.length)];
    },
};
// ゲームの状態、得点や残り時間を管理するクラス
// 残り時間を変更するときはgame.updateTime(x)
// 得点の変更はgame.updateScore(x)を用いる
class Game {
    // state(0.ゲーム開始前/1.ゲーム実行中/2.ゲーム終了後として管理)
    // ゲームモードperfectMatch、ミスタイプ時に単語毎変更される
    constructor() {
        this.score = 0;
        this.time = 0;
        this.state = 0;
        this.perfectMatch = false;
        this.randomChar = false;
    }
    updateScore(score) {
        this.score += score;
    }
    updateTime(time) {
        this.time += time;
    }
    resetTime() {
        this.time = 0;
    }
    resetScore() {
        this.score = 0;
    }
    changeState(state) {
        this.state = state;
    }
    togglePerfectMatch() {
        this.perfectMatch = !this.perfectMatch;
    }
    toggleRandomChar() {
        this.randomChar = !this.randomChar;
    }
    start() {}
}
// 問題文の生成に利用するクラス
// ランダム文字列はrandom
// 辞書から取得した文字列は未実装
class Target {
    constructor() {
        this.text = ["s", "t", "a", "r", "t"];
        this.nextText = [];
    }
    random() {
        if (this.text.length == 0) {
            for (let i = 0; i < random.number(5, 10); i++) {
                this.text.push(random.char());
            }
        }
        this.nextText = [];
        for (let i = 0; i < random.number(5, 10); i++) {
            this.nextText.push(random.char());
        }
    }
    addDictionaly(text) {
        this.nextText = text;
    }
    addFirst(text) {
        this.text = text;
    }
    push() {
        this.text = this.nextText;
    }
}
// ゲーム開始前カウントダウンの処理
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
                gameTimer();

                gameMain();
            }, 500);
            clearInterval(setTimer);
        }
    }
}
// ゲーム中のタイマーの処理(100ミリ秒ごとにタイマーを回して0以下になったらゲームを終了する)
function gameTimer() {
    HTMLtime.textContent = game.time;
    const gameInterval = setInterval(inGameTimer, 100);
    function inGameTimer() {
        game.updateTime(-1);
        if (game.time >= 0) {
            function replacedTime(num) {
                if (num >= 10) {
                    const int = Math.floor(num / 10);
                    return int + "." + (num % 10);
                } else {
                    return "0." + num;
                }
            }
            HTMLtime.textContent = replacedTime(game.time);
        } else {
            clearInterval(gameInterval);
            gameEnd();
        }
    }
}

// ゲーム開始の処理
function gameStart(button) {
    if (button.key == " ") {
        countdown(3);
        game.changeState(1);
        game.resetTime();
        game.updateTime(100);
        window.removeEventListener("keydown", gameStart);
    }
}
// ゲーム進行開始の処理(問題文を出力及び判定を開始する)
function gameMain() {
    window.addEventListener("keydown", charCheck);
    createText(target.text);
}
// 問題文と判定
// 中央の文字列をクリアする
function clearText() {
    if (MainText.hasChildNodes) {
        while (MainText.firstChild) {
            MainText.removeChild(MainText.firstChild);
        }
    }
}
// 問題文を出力する関数
function createText(text) {
    clearText();
    text.forEach((letter) => {
        // 単語を一つづつspanに包んで出力
        const letterNodes = document.createElement("span");
        letterNodes.classList.add("mx-0.5");
        letterNodes.classList.add("text-white");
        letterNodes.classList.add("q");
        letterNodes.textContent = letter;
        MainText.append(letterNodes);
    });
    target.push();
    // randomcharがonならランダムな文字列を挿入
    if (game.randomChar) {
        target.random();
    } else {
        addDictionaly();
    }
}
// 文字列チェック(ゲームのメイン部分の処理)
function charCheck(e) {
    const key = e.key;
    const question = document.querySelector(".q");
    if (question) {
        if (key == question.textContent) {
            question.classList.remove("text-white");
            question.classList.add("text-indigo-800");
            if (question.classList.contains("text-red-600")) {
                question.classList.remove("text-red-600");
            }
            question.classList.remove("q");
            // 単語クリア時の処理
            if (!document.querySelector(".q")) {
                setTimeout(createText, 100, target.text);
                game.updateScore(1);
                game.updateTime(10);
                HTMLtime.textContent = game.time;
                HTMLscore.textContent = game.score;
            } else {
                game.updateTime(1);
            }
        } else {
            if (game.perfectMatch) {
                const questions = document.querySelectorAll("#main > span");
                questions.forEach((qs) => {
                    if (qs.classList.contains("text-white")) {
                        qs.classList.remove("text-white");
                    }
                    if (qs.classList.contains("text-indigo-800")) {
                        qs.classList.remove("text-indigo-800");
                    }
                    qs.classList.add("text-red-600");
                });
                setTimeout(createText, 250, target.text);
            } else {
                question.classList.remove("text-white");
                if (!question.classList.contains("text-red-600")) {
                    question.classList.add("text-red-600");
                }
            }
        }
    }
}
// ゲーム終了(制限時間終了後の処理)
function gameEnd() {
    clearText();
    MainText.textContent = `ゲーム終了！正答数 ${game.score} 問`;
    game.changeState(2);
    window.removeEventListener("keydown", charCheck);
    ReplayButton.classList.remove("hidden");
    ReplayButton.addEventListener("click", resetGame);
    ReplayButton.focus();
}
// ゲーム終了後もう一度ボタンを押したときの処理(開始画面と同じものを表示する)
function resetGame() {
    ReplayButton.removeEventListener("click", resetGame);
    clearText();
    game.changeState(0);
    game.resetScore();
    ReplayButton.classList.add("hidden");
    MainText.textContent = "スペースキーを押して開始";
    window.addEventListener("keydown", gameStart);
}

// クラスの初期化
const game = new Game();
const target = new Target();
// ゲーム開始関数をlisten
window.addEventListener("keydown", gameStart);
async function addDictionaly() {
    try {
        const word = await getRandomWord();
        target.addDictionaly(word);
        target.push;
    } catch {
        target.random();
    }
}
// ウィンドウロード時にapiから単語を取得しておく
async function setDictionaly() {
    try {
        const word = await getRandomWord();
        target.addFirst(word);
        target.push;
    } catch {
        target.random();
    }
    addDictionaly();
}
setDictionaly();
function setRandomChar() {
    target.random();
    target.push();
    target.random();
}
// ゲームモード切り替えのボタン

// ランダム文字列モード
const randomButton = document.getElementById("toggle-random");
const randomText = document.getElementById("text-random");
randomButton.addEventListener("click", toggleRandom);
function toggleRandom() {
    game.toggleRandomChar();
    if (game.randomChar) {
        setRandomChar();
        randomText.textContent = "ランダム文字列";
    } else {
        setDictionaly();
        randomText.textContent = "辞書";
    }
    randomButton.blur();
}
const perfectButton = document.getElementById("toggle-match");
const perfectText = document.getElementById("text-match");
// 厳格モード
perfectButton.addEventListener("click", togglePerfect);
function togglePerfect() {
    game.togglePerfectMatch();
    if (game.perfectMatch) {
        perfectText.textContent = "問題ごと";
    } else {
        perfectText.textContent = "文字ごと";
    }
    perfectButton.blur();
}
