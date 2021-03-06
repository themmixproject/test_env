/*

    ~Index canvas.js~
    ----------------------

    1. Monkey Patches
    2. Global Utility Functions
    3. Canvas Properties
    4. Init Values
    5. Game Variables
        5.1 Win Combinations
    6. Event Listeners
    7. Animation Utility
    8. X Animation Function
    9. O Animation Function
    10. Drawing
    11. Game
    12. Initialize

*/

/** TO MORE AWAKE STEVEN
 * 
 * SPLIT THE FUNCTIONS CHAPTER INTO TWO OR THREE SEPERATE CHAPTERS
 * SPLIT THE VARABLES TO THE PROPERLY ASSIGNED CHAPTERS
 * 
 * REORGANIZE CHAPTERS
 * 
 * CREATE ANIMATION CLASS TO MINIMIZE ANIMATION CHAPTER
 * 
 * MAYBE SPLIT THE CODE INTO DIFFERENT FILES
 * 
 * ALL YOU NEED TO DO NOW IS ADD THE DRAWINLINE INTO THE FADEOUTRESET FUNCTION, MAKE SURE THERE'S AN ANIMATION BOOLEAN WITHIN IT
 * 
 * IF YOU HAVE THE TIME, REMOVE DEFAULT VARIABLES
 * 
 * 
 *
 * THEME : #D9695F #FFB4A8 #EFCDBF #4F9BA8 #2D3742
 * 
 * 
 * 
 * TWEAK FADOUT SO THAT IT DOES THE SAME WHEN THERE IS A TIE
 * TWEAK COMPUTER FUNCTION SO IT DOESN'T DRAW HALFWAY, AND LATER IT WILL DRAW THE FULL WINLINE
 * ADD THEME
 * 
 * 
 * TO FIX THE ISSUE THAT THE X ISN'T BEING DRAWN ON MOBILE IS BECAUSE IN THE ANIMATOIN FUNCTION THERE IS NO CONDITION OF IF WIN==TRUE AND GAME.END==TRUE, THEN THE X SHOULD JUST BE DRAWN ON THE BOARD
 * /

/**
 * 01:40:28 10-08-19 the fadeout reset animation worked for the first time
 * (it was actually 1:39, but I didn't catch the actual seconds so I had to look again)
 * 
 * 1:21:46 the first time the winline animation worked with a computer player
 * 
 * 22:10:33 12-08-19 after alot of testing, the combination manipulation bug seems to be fixed
 */









/*#####################################################\
 *|                                                    #
 *| 1. Monkey Patches                                  #
 *|                                                    #
\#####################################################*/

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

window.cancelAnimationFrame = (function () {
    return window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    function (timPtr) {
        window.clearTimeout(timPtr);
    };
})();












/*#####################################################\
 *|                                                    #
 *| 2. Global Utility Functions                        #
 *|                                                    # 
\#####################################################*/

function drawPath(x, y, x1, y1){
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x1, y1);
    c.stroke();
}

function gridX(x){
    return x * sectionWidth + topLeft.x;
}

function gridY(y){
    return y * sectionWidth + topLeft.y;
}

function resetBrush(){
    c.lineWidth = 1;
    c.strokeStyle = "black";
    c.fillStyle = "black";
    c.lineCap = "butt";

    c.globalAlpha = 1;
}















/*#####################################################\
 *|                                                    #
 *| 3. Canvas properties                               #
 *|                                                    #
\#####################################################*/


var theme = {
    cross : {
        color : "#4F9BA8",
        cap : "round",
        thickness : 10
    },
    knot : {
        color: "#D9695F",
        cap : "round",
        thickness : 10
    },
    grid : {
        color : "#2D3742",
        thickness : 10,
        cap : "round"
    },
    winLine : {
        color : "#FFEDE0",
        thickness : 10,
        cap : "round"
    },
    // background : "#FCF4C9"
    background : "#EFCDBF"
    // background : "#FFF6E6"
    // background : "#FBC49A"
};

var padding = 25;
 
var gridWidth = 350.5;
var maxGridWidth = 350.5;
var sectionWidth = gridWidth / 3;
var gridPadding = 15;
var minGridWidth = 200;

// sets grid smaller in case the window is smaller
// than the default gridWidth
if(innerWidth<gridWidth+gridPadding){
    // gridWidth = (innerWidth*0.9);
    gridWidth = innerWidth-gridPadding*2;
    sectionWidth = gridWidth / 3;
    
    theme.grid.thickness = Math.round((0.0285*gridWidth)*10)/10;
    theme.knot.thickness = Math.round((0.0285*gridWidth)*10)/10;
    theme.cross.thickness = Math.round((0.0285*gridWidth)*10)/10;
    theme.winLine.thickness = Math.round((0.0285*gridWidth)*10)/10;

    padding = Math.round((0.0713*gridWidth)*10)/10;
    
}











/*#####################################################\
 *|                                                    #
 *| 4. Init Values                                     #
 *|                                                    #
 *| These values are the standard var's of canvas.js   #
 *|                                                    #
\#####################################################*/

// setting up canvas
var canvas = document.getElementById("canvas");
canvas.style.backgroundColor = theme.background;
var c = canvas.getContext('2d');

var dpi = window.devicePixelRatio;

c.scale(dpi,dpi);

c.translate(0.5,0.5);

// var innerWidth = window.innerWidth;
// var innerHeight = window.innerHeight;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var center = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

var topLeft = {
    x: center.x - sectionWidth * 1.5,
    y: center.y - sectionWidth * 1.5
};

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66'];


// sets if player is able to put a piece down

var playerClick = true;





/*#####################################################\
 *|                                                    #
 *| 5. Game Variables                                  #
 *|                                                    #
\#####################################################*/

var grid = [];

for(var i=0;i<3;i++){
    grid.push([0,0,0]);
}

var computerMoved = false;

var game = {
    end: false,
    win: false,
    winArray: []
};











/*#################################\
 *|                                #
 *| 5.1 Win Combinations           #
 *|                                #
\#################################*/

var combinations=[];

function setCombinations(){
    

    for(var y = 0; y < 3; y++){
        var array = [];
        for(var x = 0; x < 3; x++){
            array.push([x,y]);
        }
        combinations.push(array);
    }
    
    for(var y = 0; y < 3; y++){
        array = [];
        for(var x = 0; x < 3; x++){
            array.push([y,x]);
        }
        combinations.push(array);
    }

    for(i=0;i<1;i++){
        
        var array = [];
        var array1 = [];

        for(var x=2, y=0; x >= 0; x--, y++){
            array1.push([y,y]); 
            array.push([y, x]);
        }
        
        combinations.push(array1,array);
    
    }
}




















/*#####################################################\
 *|                                                    #
 *| 6. Event Listeners                                 #
 *|                                                    #
\#####################################################*/



// event that gets execute on tap or click
function canvasEvent(clientX, clientY){
    mouse.x = clientX;
    mouse.y = clientY;

    for(x=0; x<3;x++){
        for(y=0;y<3;y++){
            if(
                mouse.x >= gridX(x) && mouse.x <= gridX(x) + sectionWidth &&
                mouse.y >= gridY(y) && mouse.y <= gridY(y) + sectionWidth
            ){
                playerTurn(x, y);
            }
        }
    }

};

// Checks if browser is mobile, and adds a touch event
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    document.addEventListener("touchstart",function(event){
        var clientX = event.touches[0].clientX;
        var clientY = event.touches[0].clientY;

        canvasEvent(clientX, clientY);
    });



}
else{
    document.addEventListener("click",function(event) {
        canvasEvent(event.clientX, event.clientY);
    })


}

window.addEventListener("resize",function(){
        
    // innerWidth = window.innerWidth;
    // innerHeight = window.innerHeight;

    if(innerWidth<minGridWidth+gridPadding*2 || innerHeight<minGridWidth+gridPadding*2){
        gridWidth = minGridWidth;
    }
    else if(innerWidth<maxGridWidth+gridPadding*2 && innerHeight>innerWidth){
        gridWidth = innerWidth-gridPadding*2;
        
        theme.grid.thickness = Math.round((0.0285*gridWidth)*10)/10;
        theme.knot.thickness = Math.round((0.0285*gridWidth)*10)/10;
        theme.cross.thickness = Math.round((0.0285*gridWidth)*10)/10;
        theme.winLine.thickness = Math.round((0.0285*gridWidth)*10)/10;

        padding = Math.round((0.0713*gridWidth)*10)/10;
    }
    else if(innerHeight<maxGridWidth+gridPadding*2 && innerWidth>innerHeight){
        gridWidth = innerHeight-gridPadding*2;

        theme.grid.thickness = Math.round((0.0285*gridWidth)*10)/10;
        theme.knot.thickness = Math.round((0.0285*gridWidth)*10)/10;
        theme.cross.thickness = Math.round((0.0285*gridWidth)*10)/10;
        theme.winLine.thickness = Math.round((0.0285*gridWidth)*10)/10;

        padding = Math.round((0.0713*gridWidth)*10)/10;
    }
    else if(innerWidth>maxGridWidth && innerHeight>maxGridWidth){
        gridWidth = maxGridWidth;
        theme.grid.thickness = 10;
        theme.knot.thickness = 10;
        theme.cross.thickness = 10;
        theme.winLine.thickness = 10;
        padding = 25;
    }

    sectionWidth = gridWidth / 3;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };

    topLeft = {
        x: center.x - sectionWidth * 1.5,
        y: center.y - sectionWidth * 1.5
    };

    // drawGrid();
    redraw(); 
});



























/*#####################################################\
 *|                                                    #
 *| 7. Animation Utility                               #
 *|                                                    #
\#####################################################*/



// X animation function position


// O animation function position


// animate winLine function position


// fadeOutRest() animation method position



/*#####################################################\
 *|                                                    #
 *| 10. Drawing                                        #
 *|                                                    #
\#####################################################*/

function drawGrid(){

    c.lineCap = theme.grid.cap;
    c.strokeStyle = theme.grid.color;
    c.lineWidth = theme.grid.thickness;
    
    // horizontal lines
    for(var y = 1, o = 1; y <= 2; y++, o=-1){
        drawPath(
            center.x - (sectionWidth * 1.5), center.y + (sectionWidth * -0.5) * o,
            center.x + (sectionWidth * 1.5), center.y + (sectionWidth * -0.5) * o
        );
    }

    // vertical lines
    for(var x = 1, o = 1; x <= 2; x++, o=-1){

        drawPath(
            center.x + (sectionWidth * -0.5) * o, center.y - (sectionWidth * 1.5),
            center.x + (sectionWidth * -0.5) * o, center.y + (sectionWidth * 1.5)
        );

    }
    
    resetBrush();

}

function redraw(){
    c.clearRect(0,0,innerHeight,innerWidth);
    drawGrid();
    grid.forEach(function(item,y){
        item.forEach(function(piece,x){
            if(piece==1){
                drawX(x,y);
            }if(piece==2){
                drawO(x,y);
            }
        });
    });
}



// drawX function position




// drawO() function position











/*#####################################################\
 *|                                                    #
 *| 11. Game                                           #
 *|                                                    #
\#####################################################*/


function playerTurn(x, y){

    if(grid[y][x] == 0 && playerClick==true & game.end == false & game.win == false){
        grid[y][x] = 1;
        animateX(x, y);
        playerClick=false;
        winCheck(1);
        if(game.end==true || game.win==true){
            gameEndDelay(1);
        }
        else if(game.end == false){
            setTimeout(function(){
                computer();
                playerClick=true;
            }, xDuration-350)
        }
    }
    
};

function computerTurn(x, y){
    grid[y][x] = 2;
    animateO(x, y);
    winCheck(2);
    if(game.win==true){
        gameEndDelay(2);
    }
}

function computer(){
    var l = combinations.length;
    var item;
    var turnArray;
    
    function computerLoop(player){

        combinations.forEach(function(array,index){

            item = combinations[i];

            for(var o=0; o<3; o++){
                if(
                    grid[ array[0][1] ][ array[0][0] ] == player &&
                    grid[ array[1][1] ][ array[1][0] ] == player &&
                    grid[ array[2][1] ][ array[2][0] ] == 0 &&
                    computerMoved == false
                ){
                    turnArray = [array[2][0] , array[2][1]];
                    computerMoved = true;
                    array.unshift(array[2]);
                    array.pop();
                }
                else {
                    array.unshift(array[2]);
                    array.pop();
                }
            };
            
        });

    }
    
    computerLoop(2);
    computerLoop(1);

    if(computerMoved == false){

        function randomBox(){

            function randomX(){
                return Math.floor(Math.random()*3);
            }
            function randomY(){
                return Math.floor(Math.random() * 3);
            }
            
            var x = randomX();
            var y = randomY();

            if( grid[y][x] != 0 ){
                randomBox();
            }
            else{
                turnArray = [x , y];
            }

            return;
        }

        randomBox();

    }
    
    computerTurn(turnArray[0], turnArray[1]);
    computerMoved = false;

    return;
}

// drawWinLine() function position

function winCheck(player){

    var winArray;
    var counter=0;
    
    combinations.forEach(function(combination){

        if(game.win==false){
            combination.forEach(function(array){
                if(grid[ array[1] ][ array[0] ] == player){
                    counter++
                };
            });
        }

        if(counter===3 && game.win==false){
            game.win=true;
            game.end=true;
            winArray = combination;
        }
        else{
            counter=0
        };

    });

    if(game.win==true && game.end==true){
        game.winArray = winArray;
    };

    counter=0;

    grid.forEach(function(array){
        array.forEach(function(item){
            if(item!=0){
                counter++;
            };
        })
    });
       
    if(counter==9 && game.end==false && game.win==false){
        game.end=true;
        playerClick = false;
    };

    // counter=0;
}

function reset(){
    game.win = false;
    game.end=false;

    grid.forEach(function(item,index){
        grid[index] = [0,0,0];
    })

    playerClick=true;

    return;
};

function gameEndDelay(player){
    if(player==1){
        setTimeout(function(){
            if(game.win==true){
                animateWinLine(game.winArray);
                setTimeout(function(){
                    playerClick = false;
                    fadeOutReset(true, game.winArray);
                    setTimeout(function(){
                        reset();
                    }, fadeDuration)
                }, winLineDuration)
            }
            else if(game.win==false && game.end==true){
                fadeOutReset();
                setTimeout(function(){
                    reset();
                }, fadeDuration)
            }
        }, xDuration)
    }
    else{
        playerClick = false;
        setTimeout(function(){
            animateWinLine(game.winArray);
            setTimeout(function(){
                fadeOutReset(true, game.winArray);
                setTimeout(function(){
                    reset();
                }, fadeDuration)
            }, winLineDuration+50)
        }, oDuration-200);
    }
}











/*#####################################################\
 *|                                                    #
 *| 12. Intialize                                      #
 *|                                                    #
\#####################################################*/

// Implementation
setCombinations();
drawGrid();


// drawX(0,0);
// drawX(1,0);
// drawX(2,0)
// grid[0][0]=1;
// grid[0][1]=1;
// grid[0][2]=1;
// setTimeout(function(){checkWin(1);},winLineDuration);
