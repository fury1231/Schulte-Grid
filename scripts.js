const grid = document.getElementById("grid");
const timerText = document.getElementById("timer");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const currentNumberText = document.getElementById("current-number");
const gridSizeSelect = document.getElementById("grid-size");
const body = document.body;
const creditDiv = document.getElementById("credit");

const leaderboardWrapper = document.createElement("div");
leaderboardWrapper.className = "leaderboard-wrapper";
leaderboardWrapper.innerHTML = `
	<div class="sidebar-header">
		<h2>本地排行榜</h2>
		<button id="toggle-sidebar" class="toggle-sidebar-btn">◀</button>
	</div>
	<ol id='score-list'></ol>
`;

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
    <div class="color-option-group"> 
        <label for="gridTextColorPicker">網格文字顏色:</label>
        <input type="color" id="gridTextColorPicker" value="#ffffff"> 
    </div>
        <div class="color-option-group">
        <label for="buttonHoverColorPicker">方框懸停顏色:</label> 
        <input type="color" id="buttonHoverColorPicker" value="#444">
    </div>
`;
leaderboardWrapper.appendChild(colorOptionsDiv);

const footerCreditDiv = document.createElement("div");
footerCreditDiv.className = "footer-credit";
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

let finishedNumbers = [];
let numbers = [];
let currentIndex = 0;
let startTime;
let interval;
let isHellMode = false;
let shuffleTimeout;
let gridSize = 10;
let maxNumber = 100;
const MAX_SCORES = 5;

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
	body.classList.add("light-mode");
}

const bgColorPicker = document.getElementById("bgColorPicker");
const correctBgColorPicker = document.getElementById("correctBgColorPicker");
const correctTextColorPicker = document.getElementById("correctTextColorPicker");
const buttonBgColorPicker = document.getElementById("buttonBgColorPicker");
const gridTextColorPicker = document.getElementById("gridTextColorPicker");
const buttonHoverColorPicker = document.getElementById("buttonHoverColorPicker"); 

// ====== 修正側邊欄收縮按鈕事件綁定 ======
let isSidebarCollapsed = false;

// 使用事件委派，在leaderboardWrapper上監聽點擊事件
leaderboardWrapper.addEventListener("click", (e) => {
	if (e.target.id === "toggle-sidebar" || e.target.classList.contains("toggle-sidebar-btn")) {
		console.log("Toggle button clicked via event delegation!"); // 除錯資訊
		isSidebarCollapsed = !isSidebarCollapsed;
		leaderboardWrapper.classList.toggle("collapsed", isSidebarCollapsed);
		
		// 更新按鈕文字
		const toggleBtn = e.target;
		toggleBtn.textContent = isSidebarCollapsed ? "▶" : "◀";
		localStorage.setItem("sidebarCollapsed", isSidebarCollapsed);
	}
});

function setupSidebarToggle() {
	const toggleSidebarBtn = document.getElementById("toggle-sidebar");
	console.log("Toggle button found:", toggleSidebarBtn); // 除錯資訊
	
	if (toggleSidebarBtn) {
		// 恢復側邊欄狀態
		const savedSidebarState = localStorage.getItem("sidebarCollapsed");
		if (savedSidebarState === "true") {
			isSidebarCollapsed = true;
			leaderboardWrapper.classList.add("collapsed");
			toggleSidebarBtn.textContent = "▶";
		}
	} else {
		console.error("Toggle sidebar button not found!"); // 除錯資訊
	}
}
setupSidebarToggle();

function applyCustomColors() {
    const savedBgColor = localStorage.getItem("customBgColor");
    const savedCorrectBgColor = localStorage.getItem("customCorrectBgColor");
    const savedCorrectTextColor = localStorage.getItem("customCorrectTextColor");
    const savedButtonBgColor = localStorage.getItem("customButtonBgColor");
    const savedGridTextColor = localStorage.getItem("customGridTextColor");
    const savedButtonHoverColor = localStorage.getItem("customButtonHoverColor"); // 新增這一行

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
    if (savedGridTextColor) {
        document.documentElement.style.setProperty("--custom-grid-text-color", savedGridTextColor);
        gridTextColorPicker.value = savedGridTextColor;
    }
    if (savedButtonHoverColor) { 
        document.documentElement.style.setProperty("--custom-button-hover-color", savedButtonHoverColor);
        buttonHoverColorPicker.value = savedButtonHoverColor;
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

gridTextColorPicker.addEventListener("input", (e) => { 
    document.documentElement.style.setProperty("--custom-grid-text-color", e.target.value);
    localStorage.setItem("customGridTextColor", e.target.value);
});

buttonHoverColorPicker.addEventListener("input", (e) => { 
    document.documentElement.style.setProperty("--custom-button-hover-color", e.target.value);
    localStorage.setItem("customButtonHoverColor", e.target.value);
});

startBtn.addEventListener("click", () => {
	// 詢問是否要開啟地獄模式
	const useHellMode = confirm("是否要開啟地獄模式？\n\n地獄模式特點：\n• 每次點擊後數字會重新打亂\n• 10秒內沒點擊會自動打亂\n• 更具挑戰性");
	
	startBtn.disabled = true;
	startBtn.style.display = "none";
	grid.style.display = "grid";
	restartBtn.style.display = "block";
	isHellMode = useHellMode;
	initGame();
});

restartBtn.addEventListener("click", () => {
	clearInterval(interval);
	clearTimeout(shuffleTimeout);
	timerText.textContent = "0.0";
	grid.innerHTML = "";
	currentIndex = 0;
	initGame();
});

function initGame() {
	finishedNumbers = [];
	numbers = Array.from({ length: maxNumber }, (_, i) => i.toString().padStart(2, "0")).sort(() => Math.random() - 0.5);
	currentIndex = 0;
	const modeText = isHellMode ? "（地獄模式）" : "";
	currentNumberText.textContent = `目標：${getCurrentTarget()}${modeText}`;
	grid.innerHTML = "";
	grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
	renderGrid();
	startTime = Date.now();
	interval = setInterval(() => {
		const elapsed = (Date.now() - startTime) / 1000;
		timerText.textContent = elapsed.toFixed(1);
	}, 100);
	if (isHellMode) {
		startShuffleTimer();
	}
}

function renderGrid() {
	grid.innerHTML = "";
	// 先渲染已完成的
	for (let i = 0; i < finishedNumbers.length; i++) {
		const cellBtn = document.createElement("button");
		cellBtn.textContent = finishedNumbers[i];
		cellBtn.classList.add("correct");
		grid.appendChild(cellBtn);
	}
	// 再渲染未完成的
	for (let i = 0; i < numbers.length; i++) {
		const cellBtn = document.createElement("button");
		cellBtn.textContent = numbers[i];
		cellBtn.addEventListener("click", () => handleClick(cellBtn, numbers[i]));
		grid.appendChild(cellBtn);
	}
}

function handleClick(btn, num) {
	const expected = getCurrentTarget();
	if (num === expected) {
		finishedNumbers.push(num);
		numbers = numbers.filter(n => n !== num);
		currentIndex++;
		btn.classList.add("correct");
		if (isHellMode && numbers.length > 0) {
			clearTimeout(shuffleTimeout);
			shuffleGrid();
			startShuffleTimer();
		} else {
			renderGrid();
		}
		if (finishedNumbers.length === maxNumber) {
			clearInterval(interval);
			clearTimeout(shuffleTimeout);
			currentNumberText.textContent = "完成！";
			const elapsed = parseFloat(timerText.textContent);
			const rating = getRating(elapsed);
			const modeText = isHellMode ? "（地獄模式）" : "";
			alert(`完成！總用時：${elapsed.toFixed(1)} 秒${modeText}\n評級：${rating}`);
			saveScore(elapsed);
			updateLeaderboard();
			leaderboardWrapper.style.display = "block";
			startBtn.style.display = "block";
			startBtn.disabled = false;
			restartBtn.style.display = "none";
		} else {
			const modeText = isHellMode ? "（地獄模式）" : "";
			currentNumberText.textContent = `目標：${getCurrentTarget()}${modeText}`;
		}
	}
}

function getRating(seconds) {
    if (maxNumber === 100) { // 10x10
        if (seconds < 200) return "大師級（已達專業訓練極限）";
        if (seconds < 300) return "優秀（掃描技巧成熟）";
        if (seconds < 400) return "中上（具備穩定視覺搜尋能力）";
        if (seconds < 500) return "普通（多數人水準）";
        if (seconds < 700) return "偏弱（可再加強策略與集中力）";
        return "初階（剛起步，重點是別斷線）";
    } else if (maxNumber === 49) { // 7x7
        if (seconds < 100) return "大師級（已達專業訓練極限）";
        if (seconds < 150) return "優秀（掃描技巧成熟）";
        if (seconds < 200) return "中上（具備穩定視覺搜尋能力）";
        if (seconds < 250) return "普通（多數人水準）";
        if (seconds < 350) return "偏弱（可再加強策略與集中力）";
        return "初階（剛起步，重點是別斷線）";
    } else if (maxNumber === 25) { // 5x5
        if (seconds < 30) return "大師級（已達專業訓練極限）";
        if (seconds < 50) return "優秀（掃描技巧成熟）";
        if (seconds < 70) return "中上（具備穩定視覺搜尋能力）";
        if (seconds < 90) return "普通（多數人水準）";
        if (seconds < 120) return "偏弱（可再加強策略與集中力）";
        return "初階（剛起步，重點是別斷線）";
    } else {
        // 其他尺寸預設用10x10標準
        if (seconds < 200) return "大師級（已達專業訓練極限）";
        if (seconds < 300) return "優秀（掃描技巧成熟）";
        if (seconds < 400) return "中上（具備穩定視覺搜尋能力）";
        if (seconds < 500) return "普通（多數人水準）";
        if (seconds < 700) return "偏弱（可再加強策略與集中力）";
        return "初階（剛起步，重點是別斷線）";
    }
}

function shuffleGrid() {
	numbers = numbers.sort(() => Math.random() - 0.5);
	renderGrid();
}

function startShuffleTimer() {
	clearTimeout(shuffleTimeout);
	shuffleTimeout = setTimeout(() => {
		if (isHellMode && currentIndex < maxNumber) {
			shuffleGrid();
			startShuffleTimer(); // 重新開始10秒倒計時
		}
	}, 10000); // 10秒
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

function getScoreKey() {
    if (maxNumber === 25) return "schulteScores_25";
    if (maxNumber === 49) return "schulteScores_49";
    return "schulteScores_100";
}

function saveScore(score) {
    let key = getScoreKey();
    let scores = getCookie(key);
    scores = scores ? JSON.parse(scores) : [];
    scores.push({ time: score.toFixed(1), date: new Date().toLocaleString() });
    scores.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
    if (scores.length > MAX_SCORES) {
        scores = scores.slice(0, MAX_SCORES);
    }
    setCookie(key, JSON.stringify(scores), 365);
}

function updateLeaderboard() {
    const scoreList = document.getElementById("score-list");
    scoreList.innerHTML = "";
    let key = getScoreKey();
    let scores = getCookie(key);
    scores = scores ? JSON.parse(scores) : [];

    // 動態顯示排行榜標題
    const leaderboardTitle = document.querySelector(".sidebar-header h2");
    if (leaderboardTitle) {
        if (maxNumber === 25) leaderboardTitle.textContent = "本地排行榜（5x5）";
        else if (maxNumber === 49) leaderboardTitle.textContent = "本地排行榜（7x7）";
        else leaderboardTitle.textContent = "本地排行榜（10x10）";
    }

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

gridSizeSelect.addEventListener("change", (e) => {
	gridSize = parseInt(e.target.value);
	maxNumber = gridSize * gridSize;
	
	// 如果遊戲正在進行，重新開始但保持地獄模式狀態
	if (startTime) {
		clearInterval(interval);
		clearTimeout(shuffleTimeout);
		timerText.textContent = "0.0";
		grid.innerHTML = "";
		currentIndex = 0;
		initGame();
	}
	// 即時更新排行榜標題和內容
	updateLeaderboard();
});

function getCurrentTarget() {
	return currentIndex.toString().padStart(2, "0"); // 所有網格都從00開始
}