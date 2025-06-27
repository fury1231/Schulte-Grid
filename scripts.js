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
    			alert(`完成！總用時：${timerText.textContent} 秒`);
    		} else {
    			currentNumberText.textContent = `目標：${currentIndex.toString().padStart(2, "0")}`;
    		}
    	}
    }