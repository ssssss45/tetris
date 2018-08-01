window.addEventListener('load', tetris);
function tetris(){
//Размеры стакана
	const GLASS_WIDTH=360;
	const GLASS_HIGHT=600;
	const GLASS_HIGHT_BRICKS=20;
	const GLASS_WIDTH_BRICKS=10;
//Размеры "кирпичей"
	var brickHeight=Math.floor(GLASS_HIGHT/GLASS_HIGHT_BRICKS);
	var brickWidth=Math.floor(GLASS_WIDTH/GLASS_WIDTH_BRICKS);
//Массив Стакана
	var glassStateArray=[[],[]];
//Флаг того что нужна новая фигура
	var figureNeeded=true;
//ID объекта стакана
	var glassObjectName="tetrisGlass";
	var glassObject=document.getElementById(glassObjectName);
//ID объекта сетки стакана (канвас над канвасом стакана)
 	var netObjectName="tetrisGlassNet"
//отрисовка сетки над стаканом
	drawNet(netObjectName);
//Задержка между авто-смещением фигуры вниз
	var fall_delta;
//Текущее состояние игры
	var state="inactive";
//объект текущей фигуры
	var figure_current={};
//таймер то опускания фигуры
var fall_countdown;
//количество очков
var score;
//Состояние паузы
	var is_paused=false;
	var keycon= new keyboardController();
	keycon.attach("tetrisGlass");
//Добавление кнопок в контроллер
	addKeyToController("left",[37]);
	addKeyToController("right",[39]);
	addKeyToController("up",[38]);
	addKeyToController("down",[40]);
	addKeyToController("space",[32]);

	function addKeyToController(name,keys)
	{
		var key={
			name: name,
			keys: keys,
			active: true
		};
		keycon.bindActions(key);
	}
//Создание массива фигур
	var figures=["1,1,0;0,1,1","0,1,1;1,1,0","1,1;1,1","1,0,0;1,1,1","0,0,1;1,1,1","0,1,0;1,1,1","1,1,1,1"];
	//var figures=["1,1;1,1"];
	var figureObjectArray=[];
	for (var i = 0, len = figures.length; i < len; i++)
	{
		var figure={};
		figure.states=[];

//создание и инициализация массивов состояний
		var state1=[[],[]];
		var state2=[[],[]];
		var state3=[[],[]];
		var state4=[[],[]];		

		var tempFigureArray=figures[i].split(";");
		var tempLineArrayToGetLength=tempFigureArray[0].split(",")
		var size=Math.max(tempFigureArray.length,tempLineArrayToGetLength.length);

		state1=initialiseState(state1,size);
		state2=initialiseState(state2,size);
		state3=initialiseState(state3,size);
		state4=initialiseState(state4,size);

		function initialiseState(state,size)
		{
			for (var i1=0; i1<size;i1++){
				state[i1]=[];
			}
			return(state);
		}

//заполнение состояний
		for (var j = 0, len1 = tempFigureArray.length; j < len1; j++)
		{
			var tempLineArray=tempFigureArray[j].split(",");
			for (var k = 0, len2 = tempLineArray.length; k < len2; k++){
				state1[j][k]=tempLineArray[k];
				state2[k][len1-j-1]=tempLineArray[k];
				state3[len1-j-1][len2-k-1]=tempLineArray[k];
				state4[len2-k-1][j]=tempLineArray[k];
			}
		}
//Удаление пустых строк из состояний
		state1=state1.filter(v=>v!='');
		state2=state2.filter(v=>v!='');
		state3=state3.filter(v=>v!='');
		state4=state4.filter(v=>v!='');
//добавление состояний к объекту фигуры и добавление фигуры в массив
		figure.states.push(state1);
		figure.states.push(state2);
		figure.states.push(state3);
		figure.states.push(state4);
		figureObjectArray.push(figure);
	}
//слушатель на событие начала игры
	document.addEventListener("tetrisGameStartEvent",function(e) {
	gamestart(e.detail.glassObject);
		});
//слушатель на событие конца игры
	document.addEventListener("tetrisGameOverEvent",function(e) {
	gameOver();
		});
//слушатель на событие паузы
	document.addEventListener("tetrisGamePauseEvent",function(e) {
	setPaused(is_paused);
		});
//очистка стакана
	var ctx =glassObject.getContext('2d');
	ctx.clearRect(0, 0, glassObject.width, glassObject.height);
//логические переменные для работы с контроллером
	var leftActive=false;
	var rightActive=false;
	var downActive=false;
	var instantFall=false;
	var rotate=false;

//начало игры
	function gamestart(glassObject)
	{
		score=0;
		is_paused=false;
		if (state=="playing")
		{
			gameOver(true);
		}
		fall_delta=700;
		fall_countdown=0
		state="playing";
		glassObject=document.getElementById(glassObjectName);
//Слушатели на нажатие и отжатие клавиш		
		glassObject.addEventListener("controls:activate",function(e) {
			activateListenerActions(e.detail.action);
		});
		glassObject.addEventListener("controls:deactivate",function(e) {
			deactivateListenerActions(e.detail.action);
		});
//инициализация массива стакана
		initialiseGlassArray(GLASS_HIGHT_BRICKS,GLASS_WIDTH_BRICKS);

		setTimeout(gamestep,40);
	}
//шаг игры
	function gamestep()
	{	
		if(figureNeeded){createFigure();}
		draw(glassObject);
		fall_countdown=fall_countdown+40;
		if ((fall_countdown>=fall_delta)||((fall_countdown>=(fall_delta/2))&&(downActive)))
		{
			fall();
		}
		if(leftActive){moveLeft();}
		if(rightActive){moveRight();}
		if ((state=="playing")&&(!is_paused)){setTimeout(gamestep,40);}


	}


//Генерация фигуры
	function createFigure()
	{
		figure_current.figure = figureObjectArray[Math.floor(Math.random() * figureObjectArray.length)];
		console.log(figure_current.figure);
		figure_current.location={};
		figure_current.location.x=0;
		figure_current.location.y=Math.floor(GLASS_WIDTH_BRICKS/2) - Math.floor(figure_current.figure.states[0][0].length/2);
		figure_current.state=0;
		figureNeeded = false;
		for (var i = 0; i < figure_current.figure.states[0].length;i++)
		{
			for (var j = 0; j < figure_current.figure.states[0][0].length;j++)
				{
					glassObject=document.getElementById(glassObjectName);
					if (glassStateArray[i][j+figure_current.location.y]==2){generateGameOverEvent()}
					glassStateArray[i][j+figure_current.location.y]=figure_current.figure.states[0][i][j];
				}
		}
	}

	//Функция движения влево
		function moveLeft()
		{
			var isMovePossible=true;
//Проверка на то что фигура не у левого края
			if (figure_current.location.y==0)
			{
				isMovePossible=false;
			}
//Проверка на то что слева нет фигур
			for (var i=figure_current.location.x+figure_current.figure.states[figure_current.state].length; i>=figure_current.location.x; i--)
			{
				for (var j=figure_current.location.y+figure_current.figure.states[figure_current.state][0].length; j>=figure_current.location.y; j--)
					{
						if ((glassStateArray[i][j]=="1")&&(glassStateArray[i][j-1]=="2"))
						{
							isMovePossible=false;
						}
					}	
			}
//движение влево
			if(isMovePossible)
			{
				for (var i=figure_current.location.x; i<=figure_current.location.x+figure_current.figure.states[figure_current.state].length; i++)
				{
					for (var j=figure_current.location.y; j<=figure_current.location.y+figure_current.figure.states[figure_current.state][0].length; j++)
						{
							if (glassStateArray[i][j]=="1")
							{
								glassStateArray[i][j]="0";
								glassStateArray[i][j-1]="1";
							}
						}	
			}	
			figure_current.location.y--;
			}

		}
//Функция движения вправо
		function moveRight()
		{
			var isMovePossible=true;
//Проверка на то что фигура не у правого края
			if ((figure_current.location.y+figure_current.figure.states[figure_current.state][0].length)==(GLASS_WIDTH_BRICKS))
			{
				isMovePossible=false;
			}
//Проверка на то что справа нет фигур
			for (var i=figure_current.location.x+figure_current.figure.states[figure_current.state].length; i>=figure_current.location.x; i--)
			{
				for (var j=figure_current.location.y+figure_current.figure.states[figure_current.state][0].length; j>=figure_current.location.y; j--)
					{
						if ((glassStateArray[i][j]=="1")&&(glassStateArray[i][j+1]=="2"))
						{
							isMovePossible=false;
						}
					}	
			}
//движение вправо
			if(isMovePossible)
			{
				for (var i=figure_current.location.x+figure_current.figure.states[figure_current.state].length; i>=figure_current.location.x; i--)
				{
					for (var j=figure_current.location.y+figure_current.figure.states[figure_current.state][0].length; j>=figure_current.location.y; j--)
						{
							if (glassStateArray[i][j]=="1")
							{
								glassStateArray[i][j]="0";
								glassStateArray[i][j+1]="1";
							}
						}	
			}	
			figure_current.location.y++;
			}

		}
//Функция автоматического опускания фигуры по таймеру
		function fall()
		{
			fall_countdown=0;
			var isFallPossible = true;

//проверка возможности опускания фигуры
//если она достигла дна стакана
			if ((figure_current.location.x+figure_current.figure.states[figure_current.state].length)==GLASS_HIGHT_BRICKS)
			{
				isFallPossible=false;
			}

//если она столкнулась с другой фигурой
			for (var i=figure_current.location.x+figure_current.figure.states[figure_current.state].length; i>=figure_current.location.x; i--)
			{
				for (var j=figure_current.location.y+figure_current.figure.states[figure_current.state][0].length; j>=figure_current.location.y; j--)
					{
						if ((glassStateArray[i][j]=="1")&&(glassStateArray[i+1][j]=="2"))
						{
							isFallPossible=false;
						}
					}	
			}

//опускание фигуры если это возможно...
			if (isFallPossible)
			{
				for (var i=figure_current.location.x+figure_current.figure.states[figure_current.state].length; i>=figure_current.location.x; i--)
				{
					for (var j=figure_current.location.y+figure_current.figure.states[figure_current.state][0].length; j>=figure_current.location.y; j--)
						{
							if (glassStateArray[i][j]=="1")
							{
								glassStateArray[i+1][j]="1";
								glassStateArray[i][j]="0";
							}
						}	
				}
			} 
//...смена состояния фигуры и установка флага на создание новой в случае если нет
			else
			{
				figureNeeded=true;
				for (var i=figure_current.location.x+figure_current.figure.states[figure_current.state].length; i>=figure_current.location.x; i--)
				{
					for (var j=figure_current.location.y+figure_current.figure.states[figure_current.state][0].length; j>=figure_current.location.y; j--)
						{
							if (glassStateArray[i][j]=="1")
							{
								glassStateArray[i][j]="2";
							}
						}	
				}

			}
			figure_current.location.x++;
			draw(glassObject);
			if ((instantFall)&&(figure_current.location.x<GLASS_HIGHT_BRICKS)){fall();}
		}

	function gameOver(flag)
	{
		state = "gameover";
		glassObject.removeEventListener("controls:activate",function(e) {
			activateListenerActions(e.detail.action);
		});
		glassObject.removeEventListener("controls:deactivate",function(e) {
			deactivateListenerActions(e.detail.action);
		});
		console.log("Worked");
		if (!flag)
		{
			var ctx =glassObject.getContext('2d');
			ctx.clearRect(0, 0, glassObject.width, glassObject.height);
			ctx.font = "30px Arial";
			ctx.fillText("Game Over",10,50);
		}
	}

//Установка игры на паузу и снятие её с паузы в зависимости от переданного параметра
	function setPaused(_paused)
	{
		is_paused=!is_paused;
		if (!is_paused)
		{
			gamestep();
		}
	}

//Возвращает стоит ли игра на паузе или нет
	function isPaused()
	{

	}

//Возвращает текущий результат игры
	function getScore()
	{

	}
//Функция инициализации массива стакана
	function initialiseGlassArray(x,y){
		for (var i = 0; i < x+3 ; i++)
		{
			glassStateArray[i]=[];
			for (var j = 0; j < y ; j++)
			{
				glassStateArray[i][j]="0";
			}
		}
	}

//даействия на нажатие кнопки
	function activateListenerActions(action)
	{
		switch(action)
		{
			case "left": leftActive=true; break;
			case "right": rightActive=true; break;
			case "down": downActive=true; break;
			case "space": instantFall=true; fall(); break;
		}
	}

//даействия на отжатие кнопки
	function deactivateListenerActions(action)
	{
		switch(action)
		{
			case "left": leftActive=false; break;
			case "right": rightActive=false; break;
			case "down": downActive=false; break;
			case "space": instantFall=false; break;
		}
	}

//отрисовка текущего состояния стакана
	function draw(object)
	{
		var flag=true;
		var ctx = object.getContext('2d');
		for (var i = 0; i < GLASS_WIDTH_BRICKS; i++)
		{
			for (var j = 0; j < GLASS_HIGHT_BRICKS; j++)
			{
				ctx.fillStyle = 'rgb(200, 0, 0)';
				if(glassStateArray[j][i]=="1")
				{
					ctx.fillRect(i*brickWidth, j*brickHeight, brickWidth , brickHeight);

				};
				ctx.fillStyle = 'rgb(200, 200, 0)';
				if(glassStateArray[j][i]=="0"){
					ctx.fillRect(i*brickWidth, j*brickHeight, brickWidth , brickHeight);
				};
				ctx.fillStyle = 'rgb(0, 100, 100)';
				if(glassStateArray[j][i]=="2"){
					ctx.fillRect(i*brickWidth, j*brickHeight, brickWidth , brickHeight);
				};
			}	
		}
        
	}
//Отрисовка сетки над стаканом	
	function drawNet(netObjectName)
	{
		var netObject=document.getElementById(netObjectName);
		console.log(netObject);
		var ctx = netObject.getContext('2d');
		ctx.beginPath();
		//var itrations=
		for (var i = 0; i <= GLASS_WIDTH; i=i+brickWidth)
		{

				ctx.moveTo(i,0);
				ctx.lineTo(i,GLASS_HIGHT);
				ctx.stroke();
		}
		for (var j = 0; j <=GLASS_HIGHT; j=j+ brickHeight)
		{
			ctx.moveTo(0,j);
			ctx.lineTo(GLASS_WIDTH,j);
			ctx.stroke();
		}
	}
}

//Генератор событий начала игры
function generateGameStartEvent(object)
{
	var event = new CustomEvent("tetrisGameStartEvent",
		{
			detail: {
				object: object
			}
		});
	document.dispatchEvent(event);
}

//Генератор событий паузы
function generateGamePauseEvent()
{
	var event = new CustomEvent("tetrisGamePauseEvent");
	document.dispatchEvent(event);		
}

//Генератор событий конца игры
function generateGameOverEvent()
{
	var event = new CustomEvent("tetrisGameOverEvent");
	document.dispatchEvent(event);	
}