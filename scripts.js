    const grid = document.getElementById("grid");
    const timerText = document.getElementById("timer");
    const startBtn = document.getElementById("start-btn");
    const toggleThemeBtn = document.getElementById("toggle-theme");
    const restartBtn = document.getElementById("restart-btn");
    const currentNumberText = document.getElementById("current-number");
    const body = document.body;
    let numbers = Array.from({
    	length: 100
    }, (_, i) => i.toString().padStart(2, "0"));
    let currentIndex = 0;
    let startTime;
    let interval;
    // 主題初始化
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
    	body.classList.add("light-mode");
    }
    toggleThemeBtn.addEventListener("click", () => {
    	body.classList.toggle("light-mode");
    	localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
    });
    startBtn.addEventListener("click", () => {
    	startBtn.disabled = true;
    	startBtn.style.display = "none";
    	toggleThemeBtn.style.display = "none";
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
    	numbers = numbers.sort(() => Math.random() - 0.5);
    	currentIndex = 0;
    	currentNumberText.textContent = `目標：${currentIndex.toString().padStart(2, "0")}`;
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