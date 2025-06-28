const grid = document.getElementById("grid");
const timerText = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const currentNumberText = document.getElementById("current-number");
const body = document.body;
const creditDiv = document.getElementById("credit");

const leaderboardWrapper = document.createElement("div");
leaderboardWrapper.className = "leaderboard-wrapper";
leaderboardWrapper.innerHTML = "<h2>本地排行榜</h2><ol id='score-list'></ol>";

const colorOptionsDiv = document.createElement("div");
colorOptionsDiv.className = "color-options";
colorOptionsDiv.innerHTML = `
    <div class="color-option-group">
        <label for="bgColorPicker">背景顏色:</label>
        <input type="color" id="bgColorPicker" value="#121212">
    </div>
    <div class="color-option-group">
        <label for="correctBgColorPicker">正確按鈕背景顏色:</label>
        <input type="color" id="correctBgColorPicker" value="#2a2a2a">
    </div>
    <div class="color-option-group">
        <label for="correctTextColorPicker">正確按鈕文字顏色:</label>
        <input type="color" id="correctTextColorPicker" value="#000000">
    </div>
    <div class="color-option-group">
        <label for="buttonBgColorPicker">方框背景顏色:</label>
        <input type="color" id="buttonBgColorPicker" value="#333">
    </div>
`;
leaderboardWrapper.appendChild(colorOptionsDiv);

const footerCreditDiv = document.createElement("div");
footerCreditDiv.textContent = "Developed by Yan © 2025.";
footerCreditDiv.style.marginTop = "auto";
footerCreditDiv.style.textAlign = "center";
footerCreditDiv.style.paddingTop = "20px";
footerCreditDiv.style.borderTop = "1px solid #444"; 
footerCreditDiv.style.color = "#aaa"; 
footerCreditDiv.style.fontSize = "12px";
leaderboardWrapper.appendChild(footerCreditDiv);


const mainContentDiv = document.createElement("div");
mainContentDiv.className = "main-content";

mainContentDiv.appendChild(document.getElementById("info-bar"));
mainContentDiv.appendChild(creditDiv);
mainContentDiv.appendChild(currentNumberText);
mainContentDiv.appendChild(document.querySelector(".button-container"));
mainContentDiv.appendChild(grid);

body.appendChild(leaderboardWrapper);
body.appendChild(mainContentDiv);
body.appendChild(restartBtn);

let numbers = Array.from({
	length: 100
}, (_, i) => i.toString().padStart(2, "0"));
let currentIndex = 0;
let startTime;
let interval;
const MAX_SCORES = 5;

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
	body.classList.add("light-mode");
}

const bgColorPicker = document.getElementById("bgColorPicker");
const correctBgColorPicker = document.getElementById("correctBgColorPicker");
const correctTextColorPicker = document.getElementById("correctTextColorPicker");
const buttonBgColorPicker = document.getElementById("buttonBgColorPicker");

function applyCustomColors() {
    const savedBgColor = localStorage.getItem("customBgColor");
    const savedCorrectBgColor = localStorage.getItem("customCorrectBgColor");
    const savedCorrectTextColor = localStorage.getItem("customCorrectTextColor");
    const savedButtonBgColor = localStorage.getItem("customButtonBgColor");

    if (savedBgColor) {
        document.documentElement.style.setProperty("--custom-bg-color", savedBgColor);
        bgColorPicker.value = savedBgColor;
    }
    if (savedCorrectBgColor) {
        document.documentElement.style.setProperty("--custom-correct-bg-color", savedCorrectBgColor);
        correctBgColorPicker.value = savedCorrectBgColor;
    }
    if (savedCorrectTextColor) {
        document.documentElement.style.setProperty("--custom-correct-text-color", savedCorrectTextColor);
        correctTextColorPicker.value = savedCorrectTextColor;
    }
    if (savedButtonBgColor) {
        document.documentElement.style.setProperty("--custom-button-bg-color", savedButtonBgColor);
        buttonBgColorPicker.value = savedButtonBgColor;
    }
}

bgColorPicker.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--custom-bg-color", e.target.value);
    localStorage.setItem("customBgColor", e.target.value);
});

correctBgColorPicker.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--custom-correct-bg-color", e.target.value);
    localStorage.setItem("customCorrectBgColor", e.target.value);
});

correctTextColorPicker.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--custom-correct-text-color", e.target.value);
    localStorage.setItem("customCorrectTextColor", e.target.value);
});

buttonBgColorPicker.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--custom-button-bg-color", e.target.value);
    localStorage.setItem("customButtonBgColor", e.target.value);
});

startBtn.addEventListener("click", () => {
	startBtn.disabled = true;
	startBtn.style.display = "none";
	grid.style.display = "grid";
	restartBtn.style.display = "block";
	initGame();
});

restartBtn.addEventListener("click", () => {
	clearInterval(interval);
	timerText.textContent = "0.0";
	grid.innerHTML = "";
	currentIndex = 0;
	initGame();
});

function initGame() {
	numbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0")).sort(() => Math.random() - 0.5);
	currentIndex = 0;
	currentNumberText.textContent = `目標：${currentIndex.toString().padStart(2, "0")}`;
	grid.innerHTML = "";
	for (let num of numbers) {
		const cellBtn = document.createElement("button");
		cellBtn.textContent = num;
		cellBtn.addEventListener("click", () => handleClick(cellBtn, num));
		grid.appendChild(cellBtn);
	}
	startTime = Date.now();
	interval = setInterval(() => {
		const elapsed = (Date.now() - startTime) / 1000;
		timerText.textContent = elapsed.toFixed(1);
	}, 100);
}

function handleClick(btn, num) {
	const expected = currentIndex.toString().padStart(2, "0");
	if (num === expected) {
		btn.classList.add("correct");
		currentIndex++;
		if (currentIndex === 100) {
            clearInterval(interval);
            currentNumberText.textContent = "完成！";
            const elapsed = parseFloat(timerText.textContent);
            const rating = getRating(elapsed);
            alert(`完成！總用時：${elapsed.toFixed(1)} 秒\n評級：${rating}`);
            saveScore(elapsed);
            updateLeaderboard();
            leaderboardWrapper.style.display = "block";

            startBtn.style.display = "block";
            startBtn.disabled = false;
            restartBtn.style.display = "none";
		} else {
			currentNumberText.textContent = `目標：${currentIndex.toString().padStart(2, "0")}`;
		}
	}
}

function getRating(seconds) {
    if (seconds < 200) return "大師級（已達專業訓練極限）";
    if (seconds < 300) return "優秀（掃描技巧成熟）";
    if (seconds < 400) return "中上（具備穩定視覺搜尋能力）";
    if (seconds < 500) return "普通（多數人水準）";
    if (seconds < 700) return "偏弱（可再加強策略與集中力）";
    return "初階（剛起步，重點是別斷線）";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function saveScore(score) {
    let scores = getCookie("schulteScores");
    scores = scores ? JSON.parse(scores) : [];
    scores.push({ time: score.toFixed(1), date: new Date().toLocaleString() });
    scores.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
    if (scores.length > MAX_SCORES) {
        scores = scores.slice(0, MAX_SCORES);
    }
    setCookie("schulteScores", JSON.stringify(scores), 365);
}

function updateLeaderboard() {
    const scoreList = document.getElementById("score-list");
    scoreList.innerHTML = "";
    let scores = getCookie("schulteScores");
    scores = scores ? JSON.parse(scores) : [];

    if (scores.length === 0) {
        scoreList.innerHTML = "<li>目前沒有任何紀錄。</li>";
        return;
    }

    scores.forEach((score, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `No.${index + 1}: <span class="score-time">${score.time} 秒</span> <span class="score-date">${score.date}</span>`;
        scoreList.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateLeaderboard();
    applyCustomColors();
});