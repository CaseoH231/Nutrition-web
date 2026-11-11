function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const button =
        document.getElementById("themeButton");
    if (
        document.body.classList.contains("dark-mode")
    ) {
        button.textContent = "☀";
    } else {
        button.textContent = "☾";
    }
    drawGame();
}
const canvas =
    document.getElementById("snakeCanvas");
const ctx =
    canvas.getContext("2d");
const scoreDisplay =
    document.getElementById("score");
const highScoreDisplay =
    document.getElementById("highScore");
const overlay =
    document.getElementById("gameOverlay");
const overlayTitle =
    document.getElementById("overlayTitle");
const overlayMessage =
    document.getElementById("overlayMessage");
const gridSize = 20;
const tileSize =
    canvas.width / gridSize;
let snake = [];
let direction = {
    x: 1,
    y: 0
};
let nextDirection = {
    x: 1,
    y: 0
};
let foods = [];
let score = 0;
function loadSavedHighScore() {
    try {
        return Number(window.localStorage.getItem("nutritionSnakeHighScore")) || 0;
    } catch (error) {
        // Some browsers block local storage for local files or private contexts.
        return 0;
    }
}
function saveHighScore() {
    try {
        window.localStorage.setItem("nutritionSnakeHighScore", String(highScore));
    } catch (error) {
        // The game remains playable even when saving is unavailable.
    }
}
let highScore = loadSavedHighScore();
let gameRunning = false;
let paused = false;
let gameOver = false;
let lastMoveTime = 0;
let moveDelay = 135;
let snakeAnimationFrame = null;
const healthyFoods = [
    {
        emoji: "🍎",
        name: "Apple"
    },
    {
        emoji: "🍌",
        name: "Banana"
    },
    {
        emoji: "🥕",
        name: "Carrot"
    },
    {
        emoji: "🥦",
        name: "Broccoli"
    },
    {
        emoji: "🍓",
        name: "Strawberry"
    },
    {
        emoji: "🍊",
        name: "Orange"
    },
    {
        emoji: "🥝",
        name: "Kiwi"
    },
    {
        emoji: "🥑",
        name: "Avocado"
    },
    {
        emoji: "🍇",
        name: "Grapes"
    },
    {
        emoji: "🥗",
        name: "Salad"
    },
    {
        emoji: "🥚",
        name: "Egg"
    },
    {
        emoji: "🐟",
        name: "Fish"
    }
];
const junkFoods = [
    {
        emoji: "🍔",
        name: "Burger"
    },
    {
        emoji: "🍕",
        name: "Pizza"
    },
    {
        emoji: "🍩",
        name: "Donut"
    },
    {
        emoji: "🍟",
        name: "Fries"
    },
    {
        emoji: "🍫",
        name: "Chocolate"
    },
    {
        emoji: "🍭",
        name: "Lollipop"
    },
    {
        emoji: "🌭",
        name: "Hot Dog"
    },
    {
        emoji: "🍰",
        name: "Cake"
    }
];
const waterFood = {
    emoji: "💧",
    name: "Water"
};
const HEALTHY_COUNT = 3;
const JUNK_COUNT = 2;
const WATER_COUNT = 1;
highScoreDisplay.textContent =
    highScore;
function resetSnakeToStart() {
    gameRunning = false;
    if (snakeAnimationFrame !== null) {
        cancelAnimationFrame(snakeAnimationFrame);
        snakeAnimationFrame = null;
    }
    paused = false;
    gameOver = false;
    score = 0;
    scoreDisplay.textContent = "0";
    overlayTitle.textContent = "Ready to play?";
    overlayMessage.textContent = "Press Start Game when you're ready. Close this game or scroll away to return here later.";
    const overlayButton = overlay.querySelector("button");
    if (overlayButton) overlayButton.textContent = "Start Game";
    overlay.classList.add("show");
    drawGame();
}
function startGame() {
    if (snakeAnimationFrame !== null) {
        cancelAnimationFrame(snakeAnimationFrame);
        snakeAnimationFrame = null;
    }
    snake = [
        {
            x: 10,
            y: 10
        },
        {
            x: 9,
            y: 10
        },
        {
            x: 8,
            y: 10
        },
        {
            x: 7,
            y: 10
        }
    ];
    direction = {
        x: 1,
        y: 0
    };
    nextDirection = {
        x: 1,
        y: 0
    };
    score = 0;
    moveDelay = 135;
    gameRunning = true;
    paused = false;
    gameOver = false;
    scoreDisplay.textContent =
        score;
    overlay.classList.remove(
        "show"
    );
    foods = [];
    for (
        let i = 0;
        i < HEALTHY_COUNT;
        i++
    ) {
        spawnFood("healthy");
    }
    for (
        let i = 0;
        i < JUNK_COUNT;
        i++
    ) {
        spawnFood("junk");
    }
    for (
        let i = 0;
        i < WATER_COUNT;
        i++
    ) {
        spawnFood("water");
    }
    lastMoveTime =
        performance.now();
    snakeAnimationFrame = requestAnimationFrame(gameLoop);
    drawGame();
}
function gameLoop(time) {
    snakeAnimationFrame = null;
    if (!gameRunning) {
        drawGame();
        return;
    }
    if (
        !paused &&
        !gameOver
    ) {
        if (
            time - lastMoveTime >=
            moveDelay
        ) {
            moveSnake();
            lastMoveTime = time;
        }
    }
    // A move can end the game. Do not schedule another frame after game over.
    if (!gameRunning) {
        drawGame();
        return;
    }
    drawGame();
    snakeAnimationFrame = requestAnimationFrame(gameLoop);
}
function moveSnake() {
    direction =
        nextDirection;
    const head = {
        x:
            snake[0].x +
            direction.x,
        y:
            snake[0].y +
            direction.y
    };
    if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
    ) {
        endGame(
            "You hit the wall!"
        );
        return;
    }
    for (
        let i = 0;
        i < snake.length;
        i++
    ) {
        if (
            head.x ===
            snake[i].x &&
            head.y ===
            snake[i].y
        ) {
            endGame(
                "You ran into yourself!"
            );
            return;
        }
    }
    snake.unshift(head);
    let eatenFood = null;
    for (
        let i = 0;
        i < foods.length;
        i++
    ) {
        if (
            head.x ===
            foods[i].x &&
            head.y ===
            foods[i].y
        ) {
            eatenFood =
                foods[i];
            break;
        }
    }
    if (eatenFood) {
        eatFood(
            eatenFood
        );
        foods =
            foods.filter(
                item =>
                    item !==
                    eatenFood
            );
        spawnFood(
            eatenFood.type
        );
    } else {
        snake.pop();
    }
}
function eatFood(foodItem) {
    if (
        foodItem.type ===
        "healthy"
    ) {
        score += 1;
    }
    else if (
        foodItem.type ===
        "water"
    ) {
        score += 2;
        const tail =
            snake[
                snake.length - 1
            ];
        snake.push({
            x: tail.x,
            y: tail.y
        });
    }
    else if (
        foodItem.type ===
        "junk"
    ) {
        score -= 2;
        if (
            snake.length > 3
        ) {
            snake.pop();
        }
        if (
            snake.length > 3
        ) {
            snake.pop();
        }
        if (
            snake.length > 3
        ) {
            snake.pop();
        }
    }
    if (score < 0) {
        score = 0;
    }
    if (
        score > highScore
    ) {
        highScore =
            score;
        saveHighScore();
        highScoreDisplay.textContent =
            highScore;
    }
    scoreDisplay.textContent =
        score;
    moveDelay =
        Math.max(
            65,
            135 -
            Math.floor(
                score / 5
            ) * 6
        );
}
function spawnFood(type) {
    let position;
    let attempts = 0;
    while (
        attempts < 500
    ) {
        position = {
            x:
                Math.floor(
                    Math.random() *
                    gridSize
                ),
            y:
                Math.floor(
                    Math.random() *
                    gridSize
                )
        };
        let occupied = false;
        for (
            const segment
            of snake
        ) {
            if (
                segment.x ===
                position.x &&
                segment.y ===
                position.y
            ) {
                occupied = true;
                break;
            }
        }
        if (!occupied) {
            for (
                const existingFood
                of foods
            ) {
                if (
                    existingFood.x ===
                    position.x &&
                    existingFood.y ===
                    position.y
                ) {
                    occupied = true;
                    break;
                }
            }
        }
        if (!occupied) {
            break;
        }
        attempts++;
    }
    let foodData;
    if (
        type ===
        "healthy"
    ) {
        foodData =
            healthyFoods[
                Math.floor(
                    Math.random() *
                    healthyFoods.length
                )
            ];
    }
    else if (
        type ===
        "junk"
    ) {
        foodData =
            junkFoods[
                Math.floor(
                    Math.random() *
                    junkFoods.length
                )
            ];
    }
    else {
        foodData =
            waterFood;
    }
    foods.push({
        x:
            position.x,
        y:
            position.y,
        type:
            type,
        emoji:
            foodData.emoji,
        name:
            foodData.name
    });
}
function drawGame() {
    const styles =
        getComputedStyle(
            document.body
        );
    // .trim() because some browsers return CSS variables with a leading
    // space, which the canvas can reject as an invalid colour.
    const background =
        styles.getPropertyValue(
            "--game-background"
        ).trim();
    const grid =
        styles.getPropertyValue(
            "--grid"
        ).trim();
    const snakeHead =
        styles.getPropertyValue(
            "--snake-head"
        ).trim();
    const snakeBody =
        styles.getPropertyValue(
            "--snake-body"
        ).trim();
    ctx.fillStyle =
        background;
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
    ctx.strokeStyle =
        grid;
    ctx.lineWidth = 1;
    for (
        let x = 0;
        x <= gridSize;
        x++
    ) {
        ctx.beginPath();
        ctx.moveTo(
            x * tileSize,
            0
        );
        ctx.lineTo(
            x * tileSize,
            canvas.height
        );
        ctx.stroke();
    }
    for (
        let y = 0;
        y <= gridSize;
        y++
    ) {
        ctx.beginPath();
        ctx.moveTo(
            0,
            y * tileSize
        );
        ctx.lineTo(
            canvas.width,
            y * tileSize
        );
        ctx.stroke();
    }
    for (
        const food
        of foods
    ) {
        let outline;
        if (
            food.type ===
            "healthy"
        ) {
            outline =
                "#4f8f68";
        }
        else if (
            food.type ===
            "junk"
        ) {
            outline =
                "#d95757";
        }
        else {
            outline =
                "#4d9ed8";
        }
        const centerX =
            food.x *
            tileSize +
            tileSize / 2;
        const centerY =
            food.y *
            tileSize +
            tileSize / 2;
        ctx.fillStyle =
            outline;
        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            tileSize * 0.39,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle =
            background;
        ctx.beginPath();
        ctx.arc(
            centerX,
            centerY,
            tileSize * 0.32,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.font =
            `${tileSize * 0.72}px Arial`;
        ctx.textAlign =
            "center";
        ctx.textBaseline =
            "middle";
        ctx.fillText(
            food.emoji,
            centerX,
            centerY + 1
        );
    }
    snake.forEach(
        (segment,index) => {
            const padding = 2.5;
            const x =
                segment.x *
                tileSize +
                padding;
            const y =
                segment.y *
                tileSize +
                padding;
            const size =
                tileSize -
                padding * 2;
            ctx.fillStyle =
                index === 0
                    ? snakeHead
                    : snakeBody;
            roundRect(
                ctx,
                x,
                y,
                size,
                size,
                5
            );
            ctx.fill();
            if (
                index === 0
            ) {
                drawSnakeEyes(
                    segment,
                    direction
                );
            }
        }
    );
    if (
        paused &&
        gameRunning &&
        !gameOver
    ) {
        ctx.fillStyle =
            "rgba(0,0,0,0.55)";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
        ctx.fillStyle =
            "white";
        ctx.font =
            "bold 32px Arial";
        ctx.textAlign =
            "center";
        ctx.textBaseline =
            "middle";
        ctx.fillText(
            "PAUSED",
            canvas.width / 2,
            canvas.height / 2
        );
    }
}
function roundRect(
    context,
    x,
    y,
    width,
    height,
    radius
) {
    context.beginPath();
    context.moveTo(
        x + radius,
        y
    );
    context.lineTo(
        x + width - radius,
        y
    );
    context.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );
    context.lineTo(
        x + width,
        y + height - radius
    );
    context.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );
    context.lineTo(
        x + radius,
        y + height
    );
    context.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );
    context.lineTo(
        x,
        y + radius
    );
    context.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );
    context.closePath();
}
function drawSnakeEyes(
    segment,
    dir
) {
    const centerX =
        segment.x *
        tileSize +
        tileSize / 2;
    const centerY =
        segment.y *
        tileSize +
        tileSize / 2;
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    if (
        dir.x !== 0
    ) {
        eyeOffsetX =
            dir.x * 4;
    }
    else {
        eyeOffsetY =
            dir.y * 4;
    }
    const eye1X =
        centerX +
        eyeOffsetX -
        (
            dir.y !== 0
                ? 4
                : 0
        );
    const eye1Y =
        centerY +
        eyeOffsetY -
        (
            dir.x !== 0
                ? 4
                : 0
        );
    const eye2X =
        centerX +
        eyeOffsetX +
        (
            dir.y !== 0
                ? 4
                : 0
        );
    const eye2Y =
        centerY +
        eyeOffsetY +
        (
            dir.x !== 0
                ? 4
                : 0
        );
    ctx.fillStyle =
        "white";
    ctx.beginPath();
    ctx.arc(
        eye1X,
        eye1Y,
        2.3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
        eye2X,
        eye2Y,
        2.3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle =
        "#222";
    ctx.beginPath();
    ctx.arc(
        eye1X,
        eye1Y,
        1,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
        eye2X,
        eye2Y,
        1,
        0,
        Math.PI * 2
    );
    ctx.fill();
}
function endGame(reason) {
    gameRunning = false;
    gameOver = true;
    if (snakeAnimationFrame !== null) {
        cancelAnimationFrame(snakeAnimationFrame);
        snakeAnimationFrame = null;
    }
    if (
        score > highScore
    ) {
        highScore =
            score;
        saveHighScore();
    }
    scoreDisplay.textContent =
        score;
    highScoreDisplay.textContent =
        highScore;
    overlayTitle.textContent =
        "Game Over!";
    overlayMessage.textContent =
        reason +
        " Final score: " +
        score +
        ".";
    // The start screen renames this button to "Start Game", so put it back.
    const overlayButton = overlay.querySelector("button");
    if (overlayButton) overlayButton.textContent = "Play Again";
    overlay.classList.add(
        "show"
    );
    drawGame();
}
function togglePause() {
    if (
        !gameRunning ||
        gameOver
    ) {
        return;
    }
    paused =
        !paused;
    drawGame();
}
document.addEventListener(
    "keydown",
    function(event) {
        // Do not let Snake controls intercept typing in any text field.
        // This is especially important for Pixel Food Challenge, where letters
        // such as W, A, S and D are valid food-name characters.
        const target = event.target;
        if (
            target instanceof HTMLElement &&
            (
                target.isContentEditable ||
                target.closest("input, textarea, select, [contenteditable='true']")
            )
        ) {
            return;
        }

        // Some keydown events (for example browser autofill) have no key.
        if (typeof event.key !== "string") {
            return;
        }
        const key =
            event.key.toLowerCase();
        if (key === " ") {
            if (gameRunning && !gameOver) {
                event.preventDefault();
                togglePause();
            }
            return;
        }
        if (paused || !gameRunning || gameOver) {
            return;
        }
        if (
            key === "arrowup" ||
            key === "w"
        ) {
            if (
                direction.y !== 1
            ) {
                nextDirection = {
                    x: 0,
                    y: -1
                };
            }
            event.preventDefault();
        }
        else if (
            key === "arrowdown" ||
            key === "s"
        ) {
            if (
                direction.y !== -1
            ) {
                nextDirection = {
                    x: 0,
                    y: 1
                };
            }
            event.preventDefault();
        }
        else if (
            key === "arrowleft" ||
            key === "a"
        ) {
            if (
                direction.x !== 1
            ) {
                nextDirection = {
                    x: -1,
                    y: 0
                };
            }
            event.preventDefault();
        }
        else if (
            key === "arrowright" ||
            key === "d"
        ) {
            if (
                direction.x !== -1
            ) {
                nextDirection = {
                    x: 1,
                    y: 0
                };
            }
            event.preventDefault();
        }
    }
);
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener(
    "touchstart",
    function(event) {
        const touch =
            event.changedTouches[0];
        touchStartX =
            touch.clientX;
        touchStartY =
            touch.clientY;
    },
    {
        passive: true
    }
);
canvas.addEventListener(
    "touchend",
    function(event) {
        if (paused) {
            return;
        }
        const touch =
            event.changedTouches[0];
        const deltaX =
            touch.clientX -
            touchStartX;
        const deltaY =
            touch.clientY -
            touchStartY;
        const minimumSwipe =
            25;
        if (
            Math.abs(deltaX) <
            minimumSwipe &&
            Math.abs(deltaY) <
            minimumSwipe
        ) {
            return;
        }
        if (
            Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {
            if (
                deltaX > 0
            ) {
                if (
                    direction.x !== -1
                ) {
                    nextDirection = {
                        x: 1,
                        y: 0
                    };
                }
            }
            else {
                if (
                    direction.x !== 1
                ) {
                    nextDirection = {
                        x: -1,
                        y: 0
                    };
                }
            }
        }
        else {
            if (
                deltaY > 0
            ) {
                if (
                    direction.y !== -1
                ) {
                    nextDirection = {
                        x: 0,
                        y: 1
                    };
                }
            }
            else {
                if (
                    direction.y !== 1
                ) {
                    nextDirection = {
                        x: 0,
                        y: -1
                    };
                }
            }
        }
    },
    {
        passive: true
    }
);
function initialiseGame() {
    snake = [
        {
            x: 10,
            y: 10
        },
        {
            x: 9,
            y: 10
        },
        {
            x: 8,
            y: 10
        },
        {
            x: 7,
            y: 10
        }
    ];
    foods = [];
    spawnFood("healthy");
    spawnFood("healthy");
    spawnFood("healthy");
    spawnFood("junk");
    spawnFood("junk");
    spawnFood("water");
    drawGame();
    resetSnakeToStart();
}
initialiseGame();


/* Game 2: Pixel Food Challenge */
(function () {
  "use strict";
  const foods = [
    {name:"Apple", aliases:["red apple","green apple"], image:"photo-1560806887-1e4cd0b6cbd6"},
    {name:"Banana", aliases:[], image:"photo-1571771894821-ce9b6c11b08e"},
    {name:"Strawberry", aliases:["strawberries"], image:"photo-1464965911861-746a04b4bca6"},
    {name:"Watermelon", aliases:[], image:"photo-1563114773-84221bd62daa"},
    {name:"Orange", aliases:["oranges"], image:"photo-1547514701-42782101795e"},
    {name:"Broccoli", aliases:[], image:"photo-1459411621453-7b03977f4bfc"},
    {name:"Carrot", aliases:["carrots"], image:"photo-1445282768818-728615cc910a"},
    {name:"Avocado", aliases:["avocados"], image:"photo-1523049673857-eb18f1d7b578"},
    {name:"Pineapple", aliases:[], image:"photo-1550258987-190a2d41a8ba"},
    {name:"Blueberries", aliases:["blueberry"], image:"photo-1498557850523-fd3d118b962e"},
    {name:"Grapes", aliases:["grape"], image:"photo-1537640538966-79f369143f8f"},
    {name:"Mango", aliases:["mangoes"], image:"photo-1553279768-865429fa0078"},
    {name:"Kiwi", aliases:["kiwifruit"], image:"photo-1585059895524-72359e06133a"},
    {name:"Lemon", aliases:["lemons"], image:"photo-1590502593747-42a996133562"},
    {name:"Peach", aliases:["peaches"], image:"photo-1639588473831-dd9d014646ae"},
    {name:"Pear", aliases:["pears"], image:"photo-1615484477778-ca3b77940c25"},
    {name:"Cherries", aliases:["cherry"], image:"photo-1610523377846-eba487f8f574"},
    {name:"Raspberries", aliases:["raspberry"], image:"photo-1577069861033-55d04cec4ef5"},
    {name:"Pumpkin", aliases:[], image:"photo-1570586437263-ab629fccc818"},
    {name:"Corn", aliases:["sweetcorn"], image:"photo-1551754655-cd27e38d2076"},
    {name:"Capsicum", aliases:["bell pepper","pepper"], image:"photo-1563565375-f3fdfdbefa83"},
    {name:"Cucumber", aliases:["cucumbers"], image:"photo-1604977042946-1eecc30f269e"},
    {name:"Tomato", aliases:["tomatoes"], image:"photo-1546094096-0df4bcaaa337"},
    {name:"Potato", aliases:["potatoes"], image:"photo-1518977676601-b53f82aba655"},
    {name:"Pizza", aliases:["pepperoni pizza"], image:"photo-1513104890138-7c749659a591"},
    {name:"Burger", aliases:["hamburger","cheeseburger"], image:"photo-1568901346375-23c9450c58cd"},
    {name:"French Fries", aliases:["fries","chips"], image:"photo-1573080496219-bb080dd4f877"},
    {name:"Doughnut", aliases:["donut","doughnuts","donuts"], image:"photo-1551024601-bec78aea704b"},
    {name:"Ice Cream", aliases:["icecream"], image:"photo-1560008581-09826d1de69e"},
    {name:"Chocolate", aliases:["chocolate bar"], image:"photo-1511381939415-e44015466834"},
    {name:"Hot Dog", aliases:["hotdog"], image:"photo-1612392062631-94dd858cba88"},
    {name:"Popcorn", aliases:[], image:"photo-1578849278619-e73505e9610f"},
    {name:"Cupcake", aliases:["cupcakes","cup cake","cup cakes"], image:"photo-1486427944299-d1955d23e34d"},
    {name:"Cookies", aliases:["cookie","biscuits"], image:"photo-1499636136210-6f4ee915583e"},
    {name:"Pancakes", aliases:["pancake"], image:"photo-1528207776546-365bb710ee93"},
    {name:"Pretzel", aliases:["pretzels"], image:"photo-1511951786553-1d4f975424c9"},
    {name:"Nachos", aliases:[], image:"photo-1513456852971-30c0b8199d4d"},
    {name:"Sushi", aliases:[], image:"photo-1579871494447-9811cf80d66c"},
    {name:"Sandwich", aliases:["sandwiches"], image:"photo-1528735602780-2552fd46c7af"},
    {name:"Toast", aliases:[], image:"photo-1525351484163-7529414344d8"}
  ];
  const TOTAL_ROUNDS = 30, ROUND_SECONDS = 20;
  const $ = id => document.getElementById("g2-" + id);
  let deck = [], spareFoods = [], currentFood = null, score = 0, correct = 0, round = 0, strikes = 0;
  let timeLeft = ROUND_SECONDS, timer = null, transitionTimer = null;
  let gameRunning = false, roundFinished = false, roundStartedAt = 0, imageLoadToken = 0;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  function normalise(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
  }
  function resetToStart() {
    gameRunning = false;
    roundFinished = true;
    imageLoadToken++; // Ignore any image that finishes loading after exiting.
    clearInterval(timer);
    clearTimeout(transitionTimer);
    timer = null;
    transitionTimer = null;
    $("guess-input").value = "";
    $("guess-input").disabled = true;
    $("guess-button").disabled = true;
    $("skip-button").disabled = true;
    $("message").textContent = "Press Start Game to begin!";
    $("message").style.color = "";
    $("strikes").textContent = "Wrong guesses: 0 / 3";
    // Clear the last game's stats and photo so they don't show behind the start screen.
    $("score").textContent = "0";
    $("time").textContent = ROUND_SECONDS;
    $("round").textContent = "1";
    $("timer-fill").style.width = "100%";
    $("timer-fill").style.background = "#35b56a";
    $("food-image").removeAttribute("src");
    $("food-image").style.opacity = "0";
    $("pixel-overlay").style.opacity = "1";
    $("start-screen").classList.remove("g2-hidden");
    $("end-screen").classList.add("g2-hidden");
  }
  function startGame() {
    clearInterval(timer); clearTimeout(transitionTimer);
    const shuffled = shuffle([...foods]);
    deck = shuffled.slice(0, TOTAL_ROUNDS);
    // Foods not used this game. If a photo fails to load, one of these
    // replaces it so the player doesn't lose a round.
    spareFoods = shuffled.slice(TOTAL_ROUNDS);
    score = 0; correct = 0; round = 0; gameRunning = true; roundFinished = false;
    $("score").textContent = score;
    $("start-screen").classList.add("g2-hidden");
    $("end-screen").classList.add("g2-hidden");
    nextRound();
  }
  function nextRound() {
    clearInterval(timer); clearTimeout(transitionTimer);
    if (!gameRunning) return;
    if (round >= TOTAL_ROUNDS) { endGame(); return; }
    round++; strikes = 0; timeLeft = ROUND_SECONDS; roundFinished = false;
    currentFood = deck[round - 1];
    $("round").textContent = round;
    $("time").textContent = timeLeft;
    $("timer-fill").style.width = "100%";
    $("timer-fill").style.background = "#35b56a";
    $("message").textContent = "";
    $("message").style.color = "#243047";
    $("strikes").textContent = "Wrong guesses: 0 / 3";
    $("guess-input").value = "";
    $("guess-input").disabled = false;
    $("guess-button").disabled = false;
    $("skip-button").disabled = false;
    const img = $("food-image");
    // Hide the previous round's photo while the next one loads. Otherwise a
    // slow network can briefly show the old food beside the new answer.
    const loadToken = ++imageLoadToken;
    img.style.opacity = "0";
    img.style.filter = "blur(24px)";
    img.alt = "Loading mystery food";
    $("pixel-overlay").style.opacity = "1";
    $("guess-input").disabled = true;
    $("guess-button").disabled = true;
    $("skip-button").disabled = true;
    $("message").textContent = "Loading food image…";

    const imageUrl = "https://images.unsplash.com/" + currentFood.image + "?auto=format&fit=crop&w=1000&q=80";
    const preload = new Image();
    const beginRound = (loaded) => {
      if (loadToken !== imageLoadToken || !gameRunning || roundFinished) return;
      if (loaded) {
        img.src = imageUrl;
        img.alt = "Mystery food";
      } else {
        // Remove the previous image entirely so a failed request can never
        // pair an old photo with this round's answer.
        img.removeAttribute("src");
        img.alt = "Food image unavailable";
        img.style.opacity = "0";
        img.style.filter = "blur(0px)";
        $("pixel-overlay").style.opacity = "0";
        $("message").textContent = "This image couldn't load. Skipping to the next food…";
        roundFinished = true;
        $("guess-input").disabled = true;
        $("guess-button").disabled = true;
        $("skip-button").disabled = true;
        if (spareFoods.length > 0) {
          // Swap in a spare food and replay this round number instead of using it up.
          deck[round - 1] = spareFoods.shift();
          round--;
        }
        transitionTimer = setTimeout(() => {
          if (gameRunning && loadToken === imageLoadToken) nextRound();
        }, 1200);
        return;
      }
      img.style.opacity = "1";
      $("guess-input").disabled = false;
      $("guess-button").disabled = false;
      $("skip-button").disabled = false;
      $("message").textContent = "";
      roundStartedAt = Date.now();
      $("guess-input").focus();
      timer = setInterval(updateTimer, 100);
    };
    preload.onload = () => beginRound(true);
    preload.onerror = () => beginRound(false);
    preload.src = imageUrl;
  }
  function updateTimer() {
    if (!gameRunning || roundFinished) return;
    const elapsed = (Date.now() - roundStartedAt) / 1000;
    timeLeft = Math.max(0, ROUND_SECONDS - elapsed);
    $("time").textContent = Math.ceil(timeLeft);
    $("timer-fill").style.width = (timeLeft / ROUND_SECONDS * 100) + "%";
    const progress = Math.min(1, elapsed / ROUND_SECONDS);
    $("food-image").style.filter = `blur(${24 * (1 - progress)}px)`;
    $("pixel-overlay").style.opacity = String(1 - progress);
    if (timeLeft <= 7) $("timer-fill").style.background = "#ff9800";
    if (timeLeft <= 3) $("timer-fill").style.background = "#e53935";
    if (timeLeft <= 0) finishRound(false, "time");
  }
  function submitGuess() {
    if (!gameRunning || roundFinished) return;
    const guess = normalise($("guess-input").value);
    if (!guess) return;
    const accepted = [currentFood.name, ...currentFood.aliases].map(normalise);
    if (accepted.includes(guess)) {
      correct++;
      const points = Math.max(10, Math.ceil(timeLeft * 10));
      score += points;
      $("score").textContent = score;
      $("message").textContent = `Correct! +${points} points!`;
      $("message").style.color = "#218838";
      finishRound(true);
      return;
    }
    strikes++;
    $("guess-input").value = "";
    $("strikes").textContent = `Wrong guesses: ${strikes} / 3`;
    $("message").textContent = strikes >= 3
      ? "Three strikes! The answer was " + currentFood.name
      : "Not quite! Try another guess.";
    $("message").style.color = "#d93025";
    if (strikes >= 3) finishRound(false, "strikes");
    else $("guess-input").focus();
  }
  function skipRound() {
    if (gameRunning && !roundFinished) finishRound(false, "skip");
  }
  function finishRound(wasCorrect, reason = "") {
    if (roundFinished) return;
    roundFinished = true; clearInterval(timer);
    $("guess-input").disabled = true;
    $("guess-button").disabled = true;
    $("skip-button").disabled = true;
    $("food-image").style.filter = "blur(0px)";
    $("pixel-overlay").style.opacity = "0";
    if (!wasCorrect) {
      if (reason === "skip") $("message").textContent = "Skipped! It was " + currentFood.name;
      else if (reason === "time") $("message").textContent = "Time's up! It was " + currentFood.name;
      else if (reason === "strikes") $("message").textContent = "The answer was " + currentFood.name;
      $("message").style.color = "#d97706";
    }
    transitionTimer = setTimeout(nextRound, 1500);
  }
  function endGame() {
    gameRunning = false; roundFinished = true;
    clearInterval(timer); clearTimeout(transitionTimer);
    $("end-title").textContent = "Challenge Complete!";
    $("end-summary").textContent = `You scored ${score} points and guessed ${correct} out of ${TOTAL_ROUNDS} foods correctly!`;
    $("end-screen").classList.remove("g2-hidden");
  }
  window.resetPixelFoodChallenge = resetToStart;
  resetToStart();
  $("start-button").addEventListener("click", startGame);
  $("restart-button").addEventListener("click", startGame);
  $("guess-button").addEventListener("click", submitGuess);
  $("skip-button").addEventListener("click", skipRound);
  $("guess-input").addEventListener("keydown", event => {
    if (event.key === "Enter") submitGuess();
  });
})();

/* Game 3: Fruit Ninja */
(function () {
  "use strict";
  const $ = id => document.getElementById("g3-" + id);
  const game = $("game-area"), scoreDisplay = $("score"), timerDisplay = $("timer");
  const message = $("message"), overlay = $("overlay"), overlayTitle = $("overlay-title");
  const overlayText = $("overlay-text"), startButton = $("start-button");
  const fruits = ["🍉","🍎","🍊","🍓","🍍","🍌","🍇","🥝","🍐","🍒"];
  const bombEmoji = "💣";
  let score = 0, timeLeft = 30, running = false;
  let spawnInterval = null, timerInterval = null, animationFrame = null;
  let objects = [], lastTime = 0;

  function clearGameObjects() {
    objects.forEach(obj => obj.element.remove());
    objects = [];
    game.querySelectorAll(".g3-slash").forEach(effect => effect.remove());
  }
  function resetToStart() {
    running = false;
    clearInterval(spawnInterval);
    clearInterval(timerInterval);
    spawnInterval = null;
    timerInterval = null;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    clearGameObjects();
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = "0";
    timerDisplay.textContent = "Time: 30";
    message.textContent = "Get ready to slice!";
    overlayTitle.textContent = "Ready, Ninja?";
    overlayText.textContent = "Move your mouse over fruit to slice it, or tap fruit on a touchscreen. Avoid bombs. You have 30 seconds.";
    startButton.textContent = "Start Game";
    overlay.classList.remove("g3-hidden");
  }
  function startGame() {
    clearInterval(spawnInterval); clearInterval(timerInterval);
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    clearGameObjects();
    score = 0; timeLeft = 30; running = true; lastTime = performance.now();
    scoreDisplay.textContent = score;
    timerDisplay.textContent = "Time: 30";
    message.textContent = "Slice the fruit! Avoid the bombs!";
    overlay.classList.add("g3-hidden");
    spawnInterval = setInterval(spawnObject, 575);
    timerInterval = setInterval(() => {
      if (!running) return;
      timeLeft = Math.max(0, timeLeft - 1);
      timerDisplay.textContent = "Time: " + timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
    spawnObject();
    animationFrame = requestAnimationFrame(animate);
  }
  function spawnObject() {
    if (!running) return;
    const element = document.createElement("div");
    element.className = "g3-fruit";
    const isBomb = Math.random() < 0.17;
    element.textContent = isBomb ? bombEmoji : fruits[Math.floor(Math.random() * fruits.length)];
    const width = game.clientWidth;
    const height = game.clientHeight;
    const x = 20 + Math.random() * Math.max(1, width - 90);
    const y = height + 30;
    const obj = {element, x, y, vx:(Math.random() - 0.5) * 3, vy:-(7 + Math.random() * 4), gravity:0.13, isBomb, sliced:false};
    element.style.left = x + "px";
    element.style.top = y + "px";
    element.addEventListener("pointerenter", () => sliceObject(obj));
    element.addEventListener("pointerdown", event => {
      event.preventDefault();
      sliceObject(obj);
    });
    game.appendChild(element);
    objects.push(obj);
  }
  function sliceObject(obj) {
    if (!running || obj.sliced) return;
    obj.sliced = true;
    if (obj.isBomb) {
      score = Math.max(0, score - 3);
      message.textContent = "Bomb! -3 points";
    } else {
      score++;
      message.textContent = "Nice slice! +1 point";
    }
    scoreDisplay.textContent = score;
    const effect = document.createElement("div");
    effect.className = "g3-slash";
    effect.textContent = obj.isBomb ? "💥" : "✦ SLASH!";
    effect.style.left = obj.x + "px";
    effect.style.top = obj.y + "px";
    game.appendChild(effect);
    setTimeout(() => effect.remove(), 400);
    obj.element.remove();
  }
  function animate(now = performance.now()) {
    if (!running) return;
    const delta = Math.min(Math.max((now - lastTime) / 16.67, 0), 2);
    lastTime = now;
    const height = game.clientHeight;
    objects = objects.filter(obj => {
      if (obj.sliced || !obj.element.isConnected) return false;
      obj.x += obj.vx * delta;
      obj.y += obj.vy * delta;
      obj.vy += obj.gravity * delta;
      obj.element.style.left = obj.x + "px";
      obj.element.style.top = obj.y + "px";
      if (obj.y > height + 100) {
        obj.element.remove();
        return false;
      }
      return true;
    });
    animationFrame = requestAnimationFrame(animate);
  }
  function endGame() {
    if (!running) return;
    running = false;
    clearInterval(spawnInterval); clearInterval(timerInterval);
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    timerDisplay.textContent = "Time: 0";
    clearGameObjects();
    overlayTitle.textContent = "Time's Up!";
    overlayText.textContent = `You scored ${score} points! ` +
      (score >= 25 ? "Legendary ninja skills!" : score >= 15 ? "Great slicing!" : score >= 8 ? "Nice effort!" : "Keep practising, ninja!");
    startButton.textContent = "Play Again";
    overlay.classList.remove("g3-hidden");
    message.textContent = "Game over!";
  }
  window.resetFruitNinja = resetToStart;
  resetToStart();
  startButton.addEventListener("click", startGame);
})();

// Exit controls and automatic reset when a game section is scrolled away.
(function () {
  const resetters = {
    snake: () => window.resetSnakeToStart(),
    pixel: () => window.resetPixelFoodChallenge(),
    fruit: () => window.resetFruitNinja()
  };
  document.querySelectorAll("[data-game-exit]").forEach(button => {
    button.addEventListener("click", () => {
      const reset = resetters[button.dataset.gameExit];
      if (reset) reset();
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          const section = entry.target;
          const reset = section.id === "section5" ? resetters.snake
            : section.id === "section6" ? resetters.pixel
            : resetters.fruit;
          if (reset) reset();
        }
      }
    }, { threshold: 0.01 });
    ["section5", "section6", "section7"].forEach(id => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();
