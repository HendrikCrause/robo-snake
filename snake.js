var $canvas,
    canvas,
    context;

var canvasSize, 
    windowHeight, 
    windowWidth,
    cellSize;

var CELL_COUNT = 15,
    SNAKE_START_LENGTH = 5,
    FPS = 8;

var UP = 38, 
    DOWN = 40, 
    LEFT = 37,
    RIGHT = 39,
    ENTER = 13,
    ESC = 27;

var direction,
    food = {x:0,y:0},
    score;

var START = 'start',
    PLAY = 'play',
    PAUSE = 'pause',
    OVER = 'over',
    gameState = START,
    stateChanged = true;

var background = new Image(),
    spritesImage = new Image(),
    start = new Image(),
    paused = new Image(),
    gameover = new Image();
background.src = 'images/background.jpg';
spritesImage.src = 'images/sprites.png';
start.src = 'images/start.png';
paused.src = 'images/pause.png';
gameover.src = 'images/gameover.png';

var SPRITE_SIZE = 100,
    SPRITE_LOCATIONS = {
        bend:{
            left_down:{x:0, y:0},
            right_down:{x:1, y:0},
            right_up:{x:2, y:0},
            left_up:{x:3, y:0}
        },
        body:{
            right:{x:0, y:1},
            down:{x:1, y:1},
            left:{x:2, y:1},
            up:{x:3, y:1}
        },
        head:{
            up:{x:0, y:2},
            down:{x:1, y:2},
            right:{x:2, y:2},
            left:{x:3, y:2}
        },
        tail:{
            up:{x:0, y:3},
            right:{x:1, y:3},
            down:{x:2, y:3},
            left:{x:3, y:3}
        },
        food:{
            0:{x:0, y:4},
            1:{x:1, y:4},
            2:{x:2, y:4},
            3:{x:3, y:4}
        }};

var snake = {
    body: [],
    create: function(){
        this.body = [];
        for(var i = SNAKE_START_LENGTH-1; i>=0; i--) {
            this.body.push({x: i, y:0});
        }
    },
    getHead: function(){
        return {
            x:snake.body[0].x,
            y:snake.body[0].y
        };
    },
    grow: function(){
        this.body.push({x: 0, y:0});
    },
    move: function(newHead){
        this.body.pop();
        this.body.unshift(newHead);
    }
};

function initGame(){
    direction = RIGHT;
    snake.create();
    initFood();
    score = 0;
}

function initFood()
{
    do {
        var newFood = {
            x: Math.round(Math.random() * (CELL_COUNT - 1)), 
            y: Math.round(Math.random() * (CELL_COUNT - 1)),
            spriteX: Math.round(Math.random()*3),
            spriteY: 4
        };
    } while(arrayContainsCoordinates(snake.body, newFood) || 
            isSameCoordinates(food, newFood));
    food = newFood;
}

function fitSquareContainer(){
    windowHeight = $(window).height();
    windowWidth = $(window).width();
    canvasSize = Math.min(windowHeight, windowWidth);
    cellSize = Math.round(canvasSize / CELL_COUNT);
    setSize(canvas, canvasSize);
    center($canvas);
    stateChanged = true;
}

function center(element){
    element.css('margin-top', calcMargin(windowHeight, canvasSize).toString());
    element.css('margin-left', calcMargin(windowWidth, canvasSize).toString());
}

function setSize(element, size){
    element.width = size;
    element.height = size;
}

function calcMargin(measurement, size){
    return Math.round((measurement - size) / 2);
}

function paintCell(x, y, spriteX, spriteY)
{
    context.drawImage(spritesImage, 
                      spriteX * SPRITE_SIZE + 1,
                      spriteY * SPRITE_SIZE + 1, 
                      SPRITE_SIZE - 2,
                      SPRITE_SIZE - 2, 
                      x * cellSize,
                      y * cellSize,
                      cellSize,
                      cellSize);
}

function arrayContainsCoordinates(array, coordinates)
{
    for(var i = 0; i < array.length; i++)
    {
        if(array[i].x === coordinates.x && array[i].y === coordinates.y)
            return true;
    }
    return false;
}

function paintBackground(){
    context.drawImage(background, 0, 0, canvasSize, canvasSize);
}

function whichHead(dir){
    switch(dir){
        case UP:
            return SPRITE_LOCATIONS.head.up;
        case DOWN:
            return SPRITE_LOCATIONS.head.down;
        case LEFT:
            return SPRITE_LOCATIONS.head.left;
        case RIGHT:
            return SPRITE_LOCATIONS.head.right;
    }
}

function whichBody(dir){
    switch(dir){
        case UP:
            return SPRITE_LOCATIONS.body.up;
        case DOWN:
            return SPRITE_LOCATIONS.body.down;
        case LEFT:
            return SPRITE_LOCATIONS.body.left;
        case RIGHT:
            return SPRITE_LOCATIONS.body.right;
    }
}

function whichTail(dir){
    switch(dir){
        case UP:
            return SPRITE_LOCATIONS.tail.up;
        case DOWN:
            return SPRITE_LOCATIONS.tail.down;
        case LEFT:
            return SPRITE_LOCATIONS.tail.left;
        case RIGHT:
            return SPRITE_LOCATIONS.tail.right;
    }
}

function currentDirection(curCell, prevCell, prevDir){
    var xChange = curCell.x - prevCell.x;
    var yChange = curCell.y - prevCell.y;

    if(((prevDir === UP    || prevDir === DOWN) && xChange === 0) ||
       ((prevDir === RIGHT || prevDir === LEFT) && yChange === 0)) {
        return prevDir;
    }
    if((prevDir === UP || prevDir === DOWN) && xChange > 0){
        return LEFT;
    }
    if((prevDir === UP || prevDir === DOWN) && xChange < 0){
        return RIGHT;
    }
    if((prevDir === LEFT || prevDir === RIGHT) && yChange > 0){
        return UP;
    }
    if((prevDir === LEFT || prevDir === RIGHT) && yChange < 0){
        return DOWN;
    }
    // Theoretically, this line will never execute
    return prevDir;
}

function isBend(prevCell, nextCell){
    var xChange = nextCell.x - prevCell.x;
    var yChange = nextCell.y - prevCell.y;
    return xChange !== 0 && yChange !== 0;
}

function whichBend(prevCell, nextCell, curCell){
    var xChangePrev = curCell.x - prevCell.x,
        yChangePrev = curCell.y - prevCell.y,
        xChangeNext = curCell.x - nextCell.x,
        yChangeNext = curCell.y - nextCell.y;

    if(yChangePrev > 0 && xChangeNext > 0 ||
       xChangePrev > 0 && yChangeNext > 0){
        return SPRITE_LOCATIONS.bend.left_up;
    }
    if(xChangePrev < 0 && yChangeNext > 0 ||
       yChangePrev > 0 && xChangeNext < 0){
        return SPRITE_LOCATIONS.bend.right_up;
    }
    if(yChangePrev < 0 && xChangeNext > 0 ||
       xChangePrev > 0 && yChangeNext < 0){
        return SPRITE_LOCATIONS.bend.left_down;
    }
    if(xChangePrev < 0 && yChangeNext < 0 ||
       yChangePrev < 0 && xChangeNext < 0){
        return SPRITE_LOCATIONS.bend.right_down;
    }
}

function paintSnake(){
    var cnt = 0;
    var cell = snake.body[cnt];
    var dir = direction;
    var sprite = whichHead(dir);
    paintCell(cell.x, cell.y, sprite.x, sprite.y);
    cnt += 1;

    while(cnt < snake.body.length - 1){
        cell = snake.body[cnt];
        var prev = snake.body[cnt - 1],
            next = snake.body[cnt + 1];
        dir = currentDirection(cell, prev, dir);

        if(isBend(prev, next)) {
            sprite = whichBend(prev, next, cell);                
        } else {
            sprite = whichBody(dir);
        }
        paintCell(cell.x, cell.y, sprite.x, sprite.y);
        cnt += 1;
    }

    cell = snake.body[cnt];
    dir = currentDirection(cell, prev, dir);
    sprite = whichTail(dir);
    paintCell(cell.x, cell.y, sprite.x, sprite.y);
}

function paintFood(){
    paintCell(food.x, food.y, food.spriteX, food.spriteY);
}

function calcFontSize(){
    var baseWidth = 600;//px
    var baseFontSize = 45;//px
    return baseFontSize / baseWidth * canvasSize;
}

function paintScore(){
    context.font = calcFontSize() + "px Arial";
    context.fillStyle = "maroon";
    var scoreText = "You ate " + score + " part heaps";
    context.fillText(scoreText, canvasSize * 0.15, canvasSize * 0.75);
}

function moveHead(head){
    if(direction === RIGHT) head.x++;
    else if(direction === LEFT) head.x--;
    else if(direction === UP) head.y--;
    else if(direction === DOWN) head.y++;
}

function isGameOver(head){
    return head.x === -1 || 
       head.x === CELL_COUNT || 
       head.y === -1 || 
       head.y === CELL_COUNT || 
       arrayContainsCoordinates(snake.body, head)
}

function isSameCoordinates(point1, point2){
    return point1.x === point2.x && point1.y === point2.y;
}

function eatFood(){
    score++;
    initFood();
    snake.grow();
}

function paintStart(){
    paintBackground();
    start.width = canvasSize - 20;
    context.drawImage(start, 10, 10, canvasSize - 20, canvasSize - 20);
    stateChanged = false;
}

function paintPlay(){
    paintBackground();

    var head = snake.getHead();
    moveHead(head);

    if(isGameOver(head))
    {
        gameState = OVER;
        stateChanged = true;
        return;
    }

    if(isSameCoordinates(head, food))
    {
        eatFood();
    }

    snake.move(head);

    paintSnake();		
    paintFood();
    stateChanged = false;
}

function paintPaused(){
    paintBackground();
    paintSnake();
    paintFood();
    paused.width = canvasSize - 20;
    context.drawImage(paused, 10, 10, canvasSize - 20, canvasSize - 20);
    stateChanged = false;
}

function paintGameOver(){
    paintBackground();
    gameover.width = canvasSize - 20;
    context.drawImage(gameover, 10, 10, canvasSize - 20, canvasSize - 20);
    paintScore();

    stateChanged = false;
}

function paint()
{
    switch(gameState){
        case START:
            paintStart();
            break;
        case PLAY:
            paintPlay();
            break;
        case PAUSE:
            paintPaused();
            break;
        case OVER:
            paintGameOver();
            break;
    }
}

function reverseDirection(direction){
    switch(direction){
        case UP: 
            return DOWN;
        case DOWN: 
            return UP;
        case RIGHT: 
            return LEFT;
        case LEFT:
            return RIGHT;
        default:
            return direction;
    }
}

$(document).keydown(function(e){
    var key = e.which;
    if(key !== reverseDirection(key) && 
       direction !== reverseDirection(key) && 
       gameState === PLAY) {
        direction = key;
    }
    else if(key === ENTER && 
            gameState !== PAUSE &&
            gameState !== PLAY){
        gameState = PLAY;
        stateChanged = true;
        initGame();
    }
    else if((key === ENTER || key === ESC) 
            && gameState === PAUSE){
        gameState = PLAY;
        stateChanged = true;
    }
    else if(key === ESC && gameState === PLAY){
        gameState = PAUSE;
        stateChanged = true;
    }
});

$(window).resize(fitSquareContainer);

$(document).ready(function(){
    $canvas = $("#canvas");
    canvas = $canvas[0];
    context = canvas.getContext("2d");
    
	fitSquareContainer();

    if(typeof gameLoop != "undefined"){ 
        clearInterval(gameLoop);
    }
    gameLoop = setInterval(paint, Math.round(1000 / FPS));
});