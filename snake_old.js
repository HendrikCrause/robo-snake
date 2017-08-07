$(document).ready(function(){
	/*
	* Please amend this code to work as you would expect a Snake game to work. We have been attending some 'excellent' clean code sessions
	* this applies to all programming languages, not just Java. See if you can apply some of your knowledge to this code.
	* 1. Make sure that there is a Game Start Screen. 
	* 2. Make sure that when the player dies, the game stops and displays 'Game Over' with the score beneath that.
	* 3. You can use sprites if you wish to make it more authentic.
	* 4. Think of appropriate backgrounds for this (it's a fast moving snake... don't have him moving on concrete...)
	* 5. The food he eats.... In the original games, these were fruits... strange!
	* BONUS
	* -----
	* 6. Bonus: Display a Highscore screen.
	* 7. Bonus 2: If you have a Highscore screen, that might mean changing a few things.. make sure you get these in as well.
	* 8 In the original game, when the snake eats something, it's speed increased slightly... think about factoring this in!
	*
	* NEXT WEEK'S SESSION
	* -------------------
	* You have 2 weeks for this. Next week we will start looking at ExtJS which is what we use in our code.
	* Prepare yourself by going through : http://docs.sencha.com/extjs/4.1.1/
	* 4.1.1 is the version we are currently running on Impact Radius, so makes sense to go through those docs instead of 5.x
	* Enjoy and remember, always have fun with your coding. 
	*/
	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	
	//Lets save the cell width in a variable for easy control
	var cw = 10;
	var d;
	var food;
	var score;
	
	//Lets create the snake now
	var snakeArray; //an array of cells to make up the snake
	
	function init()
	{
		d = "right"; //default direction
		createSnake();
		createFood(); //Now we can see the food particle
		//finally lets display the score
		score = 0;
		
		//Lets move the snake now using a timer which will trigger the paint function
		//every 60ms
		if(typeof gameLoop != "undefined") clearInterval(gameLoop);
		gameLoop = setInterval(paint, 60);
	}
	init();
	
	function createSnake()
	{
		var length = 5; //Length of the snake
		snakeArray = []; //Empty array to start with
		for(var i = length-1; i>=0; i--)
		{
			//This will create a horizontal snake starting from the top left
			snakeArray.push({x: i, y:0});
		}
	}
	
	//Lets create the food now
	function createFood()
	{
		food = {
			x: Math.round(Math.random()*(w-cw)/cw), 
			y: Math.round(Math.random()*(h-cw)/cw), 
		};
		//This will create a cell with x/y between 0-44
		//Because there are 45(450/10) positions accross the rows and columns
	}
	
	//Lets paint the snake now
	function paint()
	{
		//To avoid the snake trail we need to paint the BG on every frame
		//Lets paint the canvas now
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);
		
		//The movement code for the snake to come here.
		//The logic is simple
		//Pop out the tail cell and place it infront of the head cell
		var nx = snakeArray[0].x;
		var ny = snakeArray[0].y;
		//These were the position of the head cell.
		//We will increment it to get the new head position
		//Lets add proper direction based movement now
		if(d == "right") nx++;
		else if(d == "left") nx--;
		else if(d == "up") ny--;
		else if(d == "down") ny++;
		
		//Lets add the game over clauses now
		//This will restart the game if the snake hits the wall
		//Lets add the code for body collision
		//Now if the head of the snake bumps into its body, the game will restart
		if(nx == -1 || nx == w/cw || ny == -1 || ny == h/cw || checkCollision(nx, ny, snakeArray))
		{
			//restart game
			init();
			//Lets organize the code a bit now.
			return;
		}
		
		//Lets write the code to make the snake eat the food
		//The logic is simple
		//If the new head position matches with that of the food,
		//Create a new head instead of moving the tail
		if(nx == food.x && ny == food.y)
		{
			var tail = {x: nx, y: ny};
			score++;
			//Create new food
			createFood();
		}
		else
		{
			var tail = snakeArray.pop(); //pops out the last cell
			tail.x = nx; tail.y = ny;
		}
		//The snake can now eat the food.
		
		snakeArray.unshift(tail); //puts back the tail as the first cell
		
		for(var i = 0; i < snakeArray.length; i++)
		{
			var c = snakeArray[i];
			//Lets paint 10px wide cells
			paintCell(c.x, c.y);
		}
		
		//Lets paint the food
		paintCell(food.x, food.y);
		//Lets paint the score
		var scoreText = "Score: " + score*10;
		ctx.fillText(scoreText, 5, h-5);
	}
	
	//Lets first create a generic function to paint cells
	function paintCell(x, y)
	{
		ctx.fillStyle = "blue";
		ctx.fillRect(x*cw, y*cw, cw, cw);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cw, y*cw, cw, cw);
	}
	
	function checkCollision(x, y, array)
	{
		//This function will check if the provided x/y coordinates exist
		//in an array of cells or not
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	}
	
	//Lets add the keyboard controls now
	$(document).keydown(function(e){
		var key = e.which;
		//We will add another clause to prevent reverse gear
		if(key == "37" && d != "right") d = "left";
		else if(key == "38" && d != "down") d = "up";
		else if(key == "39" && d != "left") d = "right";
		else if(key == "40" && d != "up") d = "down";
		//The snake is now keyboard controllable
	});
		
});