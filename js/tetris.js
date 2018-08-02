window.addEventListener('load', tetris);
function tetris(){
//Размеры стакана
	const GLASS_WIDTH=360;
	const GLASS_HIGHT=600;
	const GLASS_HIGHT_BRICKS=20;
	const GLASS_WIDTH_BRICKS=10;
//Размеры "кирпичей"
	var brickHight=Math.floor(GLASS_HIGHT/GLASS_HIGHT_BRICKS);
	var brickWidth=Math.floor(GLASS_WIDTH/GLASS_WIDTH_BRICKS);

console.log(brickHight);
var renderer=new CanvasRenderer(
	{
		'GLASS_WIDTH': GLASS_WIDTH,
		'GLASS_HIGHT': GLASS_HIGHT,
		'GLASS_HIGHT_BRICKS': GLASS_HIGHT_BRICKS,
		'GLASS_WIDTH_BRICKS': GLASS_WIDTH_BRICKS,
		'brickWidth': brickWidth,
		'brickhight': brickHight,
		'containers' : 'tetrisGame'
	})

//Массив Стакана
	var glassStateArray=[[],[]];
//Флаг того что нужна новая фигура
	var figureNeeded=true;
//Задержка между авто-смещением фигуры вниз
	var fall_delta;
//Текущее состояние игры
	var state="inactive";
//объект текущей фигуры
	var current_figure={};
	current_figure.location={};
//таймер то опускания фигуры
	var fall_countdown;
//количество очков
	var score;
	var figureObjectArray=[];
//Состояние паузы
	var is_paused=false;
	var keycon= new keyboardController();
	var glassObject=renderer.getField();
	console.log(glassObject);
	keycon.attach(glassObject);
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
	initialisation();
function initialisation()
	{
//Создание массива фигур
	var figures=["1,1,0;0,1,1","0,1,1;1,1,0","1,1;1,1","1,0,0;1,1,1","0,0,1;1,1,1","0,1,0;1,1,1","1,1,1,1"];
	//var figures=["1,1;1,1"];
	figureObjectArray=[];
	for (var i = 0, len = figures.length; i < len; i++)
	{
		var figure={};
		figure.states=[];

//создание и инициализация массивов состояний
			var tempFigureArray=figures[i].split(";");
			var tempLineArrayToGetLength=tempFigureArray[0].split(",")
			var size=Math.max(tempFigureArray.length,tempLineArrayToGetLength.length);
//заполнение состояний
			fillState(1);
			fillState(2);
			fillState(3);
			fillState(4);
//функция заполнения состояний
			function fillState(stateNo)
			{
				var state=[[],[]];	

				for (var i1=0; i1<size;i1++){
					state[i1]=[];
				}

				for (var j = 0, len1 = tempFigureArray.length; j < len1; j++)
				{
					var tempLineArray=tempFigureArray[j].split(",");
					for (var k = 0, len2 = tempLineArray.length; k < len2; k++){
						switch (stateNo)
							{
								case 1: state[j][k]=tempLineArray[k]; break;
								case 2: state[k][len1-j-1]=tempLineArray[k]; break;
								case 3: state[len1-j-1][len2-k-1]=tempLineArray[k];  break;
								case 4: state[len2-k-1][j]=tempLineArray[k];  break;
							}
					}
				}
				state=state.filter(v=>v!='');	
				state.rotationCoordX=Math.floor((state[0].length-1)/2);
				state.rotationCoordY=Math.floor((state[0][0].length-1)/2);
				figure.states.push(state);
			}
//добавление новых фигур в массив фигур
			figureObjectArray.push(figure);
		}
		console.log(figureObjectArray);
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
//логические переменные для работы с контроллером
	var leftActive=false;
	var rightActive=false;
	var downActive=false;
	var instantFall=false;
	var rotate=false;

//начало игры
	function gamestart(glassObject)
	{
		if (state=="playing")
		{
			document.removeEventListener("tetrisGameStartEvent",function(e) {
			gamestart(e.detail.glassObject);
				});
			state="inactive";
			setTimeout(reset,45);
		}
		else
		{
			score=0;
			is_paused=false;
			fall_delta=700;
			fall_countdown=0
			state="playing";
			figureNeeded=true;
//Слушатели на нажатие и отжатие клавиш		
			glassObject=renderer.getField();
			glassObject.addEventListener("controls:activate",function(e) {
				activateListenerActions(e.detail.action);
			});
			glassObject.addEventListener("controls:deactivate",function(e) {
				deactivateListenerActions(e.detail.action);
			});
//инициализация массива стакана и перерисовка
			initialiseGlassArray(GLASS_HIGHT_BRICKS,GLASS_WIDTH_BRICKS);
			renderer.draw(glassStateArray);
			setTimeout(gamestep,40);
		}
//функция обрабатывающая нажатие кнопки "новая игра" во время игры	
		function reset()
		{
			document.addEventListener("tetrisGameStartEvent",function(e) {
			gamestart(e.detail.glassObject);
				});
			gameOver(false);
			gamestart();
		}
	}
//шаг игры
	function gamestep()
	{	
		if(figureNeeded){createFigure();}
		renderer.draw(glassStateArray);
		fall_countdown=fall_countdown+40;
		if ((fall_countdown>=fall_delta)||((fall_countdown>=(fall_delta/2))&&(downActive)))
		{
			fall();
		}
		if(leftActive){moveLeft();}
		if(rightActive){moveRight();}
		if(rotate){rotateFigure();}
		if ((state=="playing")&&(!is_paused)){setTimeout(gamestep,40);}
	}

//проверка возможности постановки фигуры
	function testFigurePlace(dx, dy, figure_state){
		figure_state = figure_state || current_figure.current_state;
		var figureLength=figure_state[0].length;
		console.log(figureLength);
		var figureHight=figure_state.length-1;
		for (var x = 0; x < figure_state.length;x++)
		{
			for (var y = 0; y < figure_state.length; y++)
			{
				console.log(Number(figure_state[x][y]) + Number(glassStateArray[dx+x+current_figure.location.x][dy+y+current_figure.location.y]) > 2 );

				if ( Number(figure_state[x][y]) + Number(glassStateArray[dx+x+current_figure.location.x][dy+y+current_figure.location.y]) > 2 ){
										return false;
				}
				if((dx+x+current_figure .location.x<0)||(dx+x+current_figure.location.x>GLASS_HIGHT_BRICKS)||(dy+y+current_figure.location.y<0)||(dy+y+current_figure.location.y+figureLength>GLASS_WIDTH_BRICKS)){
					return false;	
				}

			}
		}
		return true;		
	}
//Генерация фигуры
	function createFigure()
	{
		current_figure.figure = figureObjectArray[Math.floor(Math.random() * figureObjectArray.length)];
		console.log(current_figure.figure);
		current_figure.location.x=0;
		current_figure.location.y=Math.floor(GLASS_WIDTH_BRICKS/2) - Math.floor(current_figure.figure.states[0][0].length/2);
		current_figure.stateNumber=0;
		current_figure.state = current_figure.figure.states[0];
		figureNeeded = false;
		if (!testFigurePlace(0,0,current_figure.state)){generateGameOverEvent();}
		for (var i = 0; i < current_figure.figure.states[0].length;i++)
		{
			for (var j = 0; j < current_figure.figure.states[0][0].length;j++)
				{
					if (glassStateArray[i][j+current_figure.location.y]=="2"){
								generateGameOverEvent(false);
							}
					glassStateArray[i][j+current_figure.location.y]=current_figure.figure.states[0][i][j];
				}
		}
	}
//поворот фигуры
	function rotateFigure()
	{
		var gotostate = current_figure.stateNumber + 1;
		if (gotostate == 4){gotostate = 0};
		var rotationPossible=true;
		console.log("!!!");
//проверка возможности поворота
		for (var i=current_figure.location.x; i<=current_figure.location.x+current_figure.figure.states[gotostate].length; i++)
		{
			for (var j=current_figure.location.y; j<=current_figure.location.y+current_figure.figure.states[gotostate][0].length; j++)
			{
				if (glassStateArray[i][j]=="2")
				{
					rotationPossible=false;
					console.log("failed to rotate");
				}
			}
		}

		if (rotationPossible)
		{
			for (var i=current_figure.location.x; i<=current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length; i++)
				{
					for (var j=current_figure.location.y; j<=current_figure.location.y+current_figure.figure.states[current_figure.stateNumber][0].length; j++)
					{
						if (glassStateArray[i][j]=="1"){glassStateArray[i][j]="0";}
					}
				}
			current_figure.stateNumber=gotostate;
			current_figure.state=current_figure.figure.states[gotostate];
			for (var i=current_figure.location.x; i<current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length; i++)
				{
					for (var j=current_figure.location.y; j<current_figure.location.y+current_figure.figure.states[current_figure.stateNumber][0].length; j++)
					{
						if (current_figure.figure.states[current_figure.stateNumber][i-current_figure.location.x][j-current_figure.location.y]=="1"){glassStateArray[i][j]="1";}
					}
				}	
		}

	}

//Функция движения влево
		function moveLeft()
		{
//проверка возможности размещения фигуры
			if(testFigurePlace(0,-1,current_figure.state))
//движение влево
			{
				for (var i=current_figure.location.x; i<=current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length; i++)
				{
					for (var j=current_figure.location.y; j<=current_figure.location.y+current_figure.figure.states[current_figure.stateNumber][0].length; j++)
						{
							if (glassStateArray[i][j]=="1")
							{
								glassStateArray[i][j]="0";
								glassStateArray[i][j-1]="1";
							}
						}	
			}	
			current_figure.location.y--;
			}

		}
//Функция движения вправо
		function moveRight()
		{
//проверка возможности размещения фигуры
			if(testFigurePlace(0,+1,current_figure.state))
//движение вправо
			{
				for (var i=current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length; i>=current_figure.location.x; i--)
				{
					for (var j=current_figure.location.y+current_figure.figure.states[current_figure.stateNumber][0].length; j>=current_figure.location.y; j--)
						{
							if (glassStateArray[i][j]=="1")
							{
								glassStateArray[i][j]="0";
								glassStateArray[i][j+1]="1";
							}
						}	
			}	
			current_figure.location.y++;
			}

		}
//Функция автоматического опускания фигуры по таймеру
		function fall()
		{
			fall_countdown=0;
			var isFallPossible = true;

//проверка возможности опускания фигуры
//если она достигла дна стакана
			if ((current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length)==GLASS_HIGHT_BRICKS)
			{
				isFallPossible=false;
			}

//если она столкнулась с другой фигурой
			for (var i=current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length; i>=current_figure.location.x; i--)
			{
				for (var j=current_figure.location.y+current_figure.figure.states[current_figure.stateNumber][0].length; j>=current_figure.location.y; j--)
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
				for (var i=current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length; i>=current_figure.location.x; i--)
				{
					for (var j=current_figure.location.y+current_figure.figure.states[current_figure.stateNumber][0].length; j>=current_figure.location.y; j--)
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
				for (var i=current_figure.location.x+current_figure.figure.states[current_figure.stateNumber].length; i>=current_figure.location.x; i--)
				{
					for (var j=current_figure.location.y+current_figure.figure.states[current_figure.stateNumber][0].length; j>=current_figure.location.y; j--)
						{
							if (glassStateArray[i][j]=="1")
							{
								glassStateArray[i][j]="2";
							}
						}	
				}
//проверка на заполненные ряды
			checkFilledRows();
			}
			current_figure.location.x++;
			renderer.draw(glassStateArray);
			if ((instantFall)&&(current_figure.location.x<GLASS_HIGHT_BRICKS)){fall();}
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
		if (flag)
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
		for (var i = -1; i < x+3 ; i++)
		{
			glassStateArray[i]=[];
			for (var j = -1; j < y ; j++)
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
			case "up": rotate=true; break;
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
			case "up": rotate=false; break;
		}
	}

//проверка заполненности рядов
	function checkFilledRows()
	{
		var rowFlag;
		for (var i=GLASS_HIGHT_BRICKS; i>0;i--)
		{
			rowFlag = true;
			for (var j=GLASS_WIDTH_BRICKS; j>0;j--)	
			{
				if (glassStateArray[i][j]=="0")
				{
					rowFlag=false;
				}
			}
			if (rowFlag)
			{
				dragDown(i);
				fall_delta=fall_delta-25;
				score++;
				i++;
			}
		}
//Опускание содержимого стакана
		function dragDown(row)
		{
			for (var i=row; i>=0;i--)
			{
				for (var j=GLASS_WIDTH_BRICKS; j>=0;j--)	
				{
					glassStateArray[i][j]=glassStateArray[i-1][j];
					
				}
			}
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
//598