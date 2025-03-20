document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const endBtn = document.getElementById('end-btn');
    const scoreValue = document.getElementById('score-value');
    const prevScoreValue = document.getElementById('prev-score-value');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    let player = { 
        x: 180, 
        y: 500, 
        width: 60, 
        height: 60, 
        hitboxWidth: 30,
        hitboxHeight: 30,
        speed: 5 
    };
    let obstacles = [];
    let score = 0;
    let gameRunning = false;
    let animationFrameId;
    let explosion = null;

    const playerImg = new Image();
    playerImg.src = 'images/player.png';
    const wallImg = new Image();
    wallImg.src = 'images/wall.png';
    const skyImg = new Image();
    skyImg.src = 'images/sky.png';
    const explosionImg = new Image();
    explosionImg.src = 'images/explosion.png';
    const birdImg = new Image();
    birdImg.src = 'images/bird.png';

    let imagesLoaded = 0;
    const totalImages = 5;

    function checkImagesLoaded() {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            startBtn.disabled = false;
        }
    }

    playerImg.onload = checkImagesLoaded;
    playerImg.onerror = () => { console.error('Помилка завантаження player.png'); checkImagesLoaded(); };
    wallImg.onload = checkImagesLoaded;
    wallImg.onerror = () => { console.error('Помилка завантаження wall.png'); checkImagesLoaded(); };
    skyImg.onload = checkImagesLoaded;
    skyImg.onerror = () => { console.error('Помилка завантаження sky.png'); checkImagesLoaded(); };
    explosionImg.onload = checkImagesLoaded;
    explosionImg.onerror = () => { console.error('Помилка завантаження explosion.png'); checkImagesLoaded(); };
    birdImg.onload = checkImagesLoaded;
    birdImg.onerror = () => { console.error('Помилка завантаження bird.png'); checkImagesLoaded(); };

    startBtn.disabled = true;

    const prevScore = localStorage.getItem('prevScore');
    if (prevScore) prevScoreValue.textContent = prevScore;

    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';
        endBtn.style.display = 'block';
        gameRunning = true;
        score = 0;
        obstacles = [];
        player.x = 180;
        explosion = null;
        scoreValue.textContent = score;
        gameLoop();
    });

    endBtn.addEventListener('click', () => {
        gameRunning = false;
        cancelAnimationFrame(animationFrameId);
        saveResults();
        startBtn.style.display = 'block';
        endBtn.style.display = 'none';
    });

    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
        }
        movePlayer(e.key);
    });

    leftBtn.addEventListener('click', () => movePlayer('ArrowLeft'));
    rightBtn.addEventListener('click', () => movePlayer('ArrowRight'));

    function movePlayer(key) {
        if (!gameRunning) return;
        switch (key) {
            case 'ArrowLeft':
                if (player.x > 0) player.x -= player.speed;
                break;
            case 'ArrowRight':
                if (player.x < canvas.width - player.width) player.x += player.speed;
                break;
        }
    }

    function spawnObstacle() {
        const x = Math.random() * (canvas.width - 30);
        const type = Math.random() < 0.7 ? 'wall' : 'bird';
        if (type === 'wall') 
            obstacles.push({ 
                x: x, 
                y: 0, 
                width: 40, 
                height: 40, 
                hitboxWidth: 30,
                hitboxHeight: 30,
                speed: 3,
                type: 'wall'
            });
        
    }

    function gameLoop() {
        if (!gameRunning && !explosion) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (skyImg.complete && skyImg.naturalWidth !== 0) {
            ctx.drawImage(skyImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'skyblue';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (explosion) {
            if (explosionImg.complete && explosionImg.naturalWidth !== 0) {
                ctx.drawImage(explosionImg, explosion.x, explosion.y, 50, 50);
            }
            const currentTime = Date.now();
            if (currentTime - explosion.startTime >= 500) {
                explosion = null;
                gameRunning = false;
                cancelAnimationFrame(animationFrameId);
                saveResults();
                startBtn.style.display = 'block';
                endBtn.style.display = 'none';
                return;
            }
        }

        if (!explosion) {
            if (playerImg.complete && playerImg.naturalWidth !== 0) {
                ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
            } else {
                ctx.fillStyle = 'blue';
                ctx.fillRect(player.x, player.y, player.width, player.height);
            }
        }

        obstacles.forEach((obstacle, index) => {
            if (obstacle.type === 'wall') {
                obstacle.y += obstacle.speed;
            } else if (obstacle.type === 'bird') {
                obstacle.y += obstacle.speed;
                obstacle.x = obstacle.x + Math.sin(obstacle.y * obstacle.frequency) * obstacle.amplitude;
            }

            if (obstacle.type === 'wall') {
                if (wallImg.complete && wallImg.naturalWidth !== 0) {
                    ctx.drawImage(wallImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            } else if (obstacle.type === 'bird') {
                if (birdImg.complete && birdImg.naturalWidth !== 0) {
                    ctx.drawImage(birdImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                } else {
                    ctx.fillStyle = 'gray';
                    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                }
            }

            if (!explosion && checkCollision(player, obstacle)) {
                explosion = {
                    x: player.x - 5,
                    y: player.y - 5,
                    startTime: Date.now()
                };
                return;
            }

            if (obstacle.y > canvas.height) {
                obstacles.splice(index, 1);
            }
        });

        if (!explosion) {
            score += 0.1;
            scoreValue.textContent = Math.floor(score);
        }

        if (!explosion && Math.random() < 0.02) spawnObstacle();

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.hitboxWidth &&
               obj1.x + obj1.hitboxWidth > obj2.x &&
               obj1.y < obj2.y + obj2.hitboxHeight &&
               obj1.y + obj1.hitboxHeight > obj2.y;
    }

    function saveResults() {
        const result = {
            date: new Date().toISOString().split('T')[0],
            score: Math.floor(score)
        };

        fetch('/results.json')
            .then(response => response.json())
            .catch(() => [])
            .then(data => {
                const results = data;
                results.push(result);

                fetch('/save-results', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(results)
                })
                .then(response => response.text())
                .then(message => console.log(message))
                .catch(error => console.error('Помилка збереження:', error));

                if (results.length > 1) {
                    const prevScore = results[results.length - 2].score;
                    localStorage.setItem('prevScore', prevScore);
                    prevScoreValue.textContent = prevScore;
                }
            });
    }
});