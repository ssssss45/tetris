class Tetris{
/*
██╗███╗   ██╗██╗████████╗
██║████╗  ██║██║╚══██╔══╝
██║██╔██╗ ██║██║   ██║   
██║██║╚██╗██║██║   ██║   
██║██║ ╚████║██║   ██║   
╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝  
*/
	constructor(params)
	{
//Размеры стакана
	this.GLASS_WIDTH = params.GLASS_WIDTH || 360;
	this.GLASS_HIGHT = params.GLASS_HIGHT || 600;
	this.GLASS_HIGHT_BRICKS = params.GLASS_HIGHT_BRICKS || 20;
	this.GLASS_WIDTH_BRICKS = params.GLASS_WIDTH_BRICKS || 10;
//Создание массива фигур
	this.figures=params.FIGURES || ["1,1,0;0,1,1","0,1,1;1,1,0","1,1;1,1","1,0,0;1,1,1","0,0,1;1,1,1","0,1,0;1,1,1","1,1,1,1"];
//Размеры "кирпичей"
	this.brickHight=Math.floor(this.GLASS_HIGHT/this.GLASS_HIGHT_BRICKS);
	this.brickWidth=Math.floor(this.GLASS_WIDTH/this.GLASS_WIDTH_BRICKS);
//данные задержек
	this.fallDeltaDefault = params.fallDelta|| 700;
	this.gameStepTimer = params.gameStepTimer || 40;
//запись контейнера с счетом	
	this.pointContainer = document.getElementsByClassName(params.pointContainer)[0];
	console.log(this.pointContainer);
//инициализация рендеерера
	this.renderer= new CanvasRenderer(
	{
		'GLASS_WIDTH': this.GLASS_WIDTH,
		'GLASS_HIGHT': this.GLASS_HIGHT,
		'GLASS_HIGHT_BRICKS': this.GLASS_HIGHT_BRICKS,
		'GLASS_WIDTH_BRICKS': this.GLASS_WIDTH_BRICKS,
		'brickWidth': this.brickWidth,
		'brickhight': this.brickHight,
		'containers' : params.container
	})

//Массив Стакана
	this.glassStateArray=[[],[]];
//Флаг того что нужна новая фигура
	this.figureNeeded=true;
//Задержка между авто-смещением фигуры вниз
	this.fall_delta;
//Текущее состояние игры
	this.state="inactive";
//объект текущей фигуры
	this.current_figure={};
	this.current_figure.location={};
//таймер то опускания фигуры
	this.fall_countdown;
//количество очков
	this.score=0;
	this.setScore(this);
//массив фигур
	this.figureObjectArray=[];
//Состояние паузы
	this.is_paused=false;
	this.keycon= new keyboardController();
//получение объекта поля из рендерера (для слушателей)	
	this.glassObject=this.renderer.getField();
	console.log(this.glassObject);
	this.keycon.attach(this.glassObject);
//Добавление кнопок в контроллер
	addKeyToController("left",[37],this.keycon);
	addKeyToController("right",[39],this.keycon);
	addKeyToController("up",[38],this.keycon);
	addKeyToController("down",[40],this.keycon);
	addKeyToController("space",[32],this.keycon);
	function addKeyToController(name,keys,keycon)
	{
		var key={
			name: name,
			keys: keys,
			active: true
		};
		keycon.bindActions(key);
	}
	console.log(this.actions);

	// this.figures=["1,1;1,1"];
	this.figureObjectArray=[];
	for (var i = 0, len = this.figures.length; i < len; i++)
	{
		var figure={};
		figure.states=[];

//создание и инициализация массивов состояний
		 var tempFigureArray=this.figures[i].split(";");
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
		this.figureObjectArray.push(figure);
	}
//логические переменные для работы с контроллером
	this.leftActive=false;
	this.rightActive=false;
	this.downActive=false;
	this.instantFall=false;
	this.rotate=false;

	this.boundGameStep=this.gamestep.bind(this);
	}

	startListeners()
	{
		var boundGameStart=this.gamestart.bind(this);
//слушатель на событие начала игры
		document.addEventListener("tetrisGameStartEvent",boundGameStart);
//слушатель на событие конца игры
		document.addEventListener("tetrisGameOverEvent",function(e) {
		this.gameOver;
			});
//слушатель на событие паузы
		document.addEventListener("tetrisGamePauseEvent",function(e) {
		setPaused(this.is_paused);
			});
	}
	

/*
██╗███╗   ██╗██╗████████╗
██║████╗  ██║██║╚══██╔══╝
██║██╔██╗ ██║██║   ██║   
██║██║╚██╗██║██║   ██║   
██║██║ ╚████║██║   ██║   
╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝  
*/

//начало игры
	gamestart()
	{
		var boundActivateListenerActions =activateListenerActions .bind(this);
		var boundDeactivateListenerActions =deactivateListenerActions .bind(this);
		this.setScore(this);
		this.score=0;
		this.is_paused=false;
		this.fall_delta=this.fallDeltaDefault;
		this.fall_countdown=0
		this.state="playing";
		this.figureNeeded=true;
		console.log(this.renderer);
//Слушатели на нажатие и отжатие клавиш		
		this.glassObject=this.renderer.getField();
		this.glassObject.addEventListener("controls:activate",function(e) {
			boundActivateListenerActions(e.detail.action);
		});
		this.glassObject.addEventListener("controls:deactivate",function(e) {
			boundDeactivateListenerActions(e.detail.action);
		});

//действия на нажатие кнопки
			function activateListenerActions(action, currentThis)
			{
				switch(action)
				{
//					case "left": this.leftActive=true; break;
//					case "right": this.rightActive=true; break;
					case "down": this.downActive=true; break;
					case "space": this.instantFall=true; this.fall(this); break;
//					case "up": this.rotate=true; break;
				}
			}

//действия на отжатие кнопки
			function deactivateListenerActions(action, currentThis)
			{
				console.log(action);
				switch(action)
				{
					case "left": this.leftActive=true; break;
					case "right": this.rightActive=true; break;
					case "down": this.downActive=false; break;
					case "space": this.instantFall=false; break;
					case "up": this.rotate=true; break;
				}
			}
//инициализация массива стакана и перерисовка
		initialiseGlassArray(this.GLASS_HIGHT_BRICKS,this.GLASS_WIDTH_BRICKS,this);
		//Функция инициализации массива стакана
		function initialiseGlassArray(x,y,p){
		for (var i = -1; i < x+3 ; i++)
		{
			p.glassStateArray[i]=[];
			for (var j = -1; j < y ; j++)
			{
				p.glassStateArray[i][j]="0";
			}
		}
	}
		this.renderer.draw(this.glassStateArray);
		setTimeout(this.boundGameStep,this.gameStepTimer);
	}
//шаг игры
	gamestep()
	{	
		if(this.figureNeeded){this.createFigure(this);}
		this.renderer.draw(this.glassStateArray);
		this.fall_countdown=this.fall_countdown+40;
		if ((this.fall_countdown>=this.fall_delta)||((this.fall_countdown>=(this.fall_delta/2))&&(this.downActive)))
		{
			this.fall(this);
		}
		if(this.leftActive){this.moveLeft(this); this.leftActive=false;}
		if(this.rightActive){this.moveRight(this); this.rightActive=false;}
		if(this.rotate){this.rotateFigure(this); this.rotate=false;}
		if ((this.state=="playing")&&(!this.is_paused)){setTimeout(this.boundGameStep,this.gameStepTimer);}
	}

//Генерация фигуры
	createFigure(currentThis)
	{

		currentThis.current_figure.figure = currentThis.figureObjectArray[Math.floor(Math.random() * currentThis.figureObjectArray.length)];
		console.log(currentThis .current_figure.figure);
		currentThis.current_figure.location.x=0;
		currentThis.current_figure.location.y=Math.floor(currentThis.GLASS_WIDTH_BRICKS/2) - Math.floor(currentThis.current_figure.figure.states[0][0].length/2);
		currentThis.current_figure.stateNumber=0;
		currentThis.current_figure.state = currentThis.current_figure.figure.states[0];
		currentThis.figureNeeded = false;
		if (!this.testFigurePlace(0,0,currentThis.current_figure.state,currentThis)){generateGameOverEvent();}
		for (var i = 0; i < currentThis.current_figure.figure.states[0].length;i++)
		{
			for (var j = 0; j < currentThis.current_figure.figure.states[0][0].length;j++)
				{
					if (currentThis.glassStateArray[i][j+currentThis.current_figure.location.y]=="2"){
								generateGameOverEvent(false);
							}
					currentThis.glassStateArray[i][j+currentThis.current_figure.location.y]=currentThis.current_figure.figure.states[0][i][j];
				}
		}
	}

/*
███╗   ███╗ ██████╗ ██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗
████╗ ████║██╔═══██╗██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
██╔████╔██║██║   ██║██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝  
*/	
//проверка возможности постановки фигуры
	 testFigurePlace(dx, dy, figure_state,currentThis){
		figure_state = figure_state || currentThis.current_figure.state;
		var figureLength=figure_state[0].length;
		var figureHight=figure_state.length;
		console.log(currentThis);
		for (var x = 0; x < figureHight;x++)
		{
			for (var y = 0; y < figureLength; y++)
			{
				if ( Number(figure_state[x][y]) + Number(currentThis.glassStateArray[dx+x+currentThis.current_figure.location.x][dy+y+currentThis.current_figure.location.y]) > 2 ){
										return false;
				}

			}
		}
		if((dx+currentThis.current_figure.location.x<0)||(dx+currentThis.current_figure.location.x+figureHight>currentThis.GLASS_HIGHT_BRICKS)||(dy+currentThis.current_figure.location.y<0)||(dy+currentThis.current_figure.location.y+figureLength>currentThis.GLASS_WIDTH_BRICKS)){
		return false;	
				}
		return true;		
	}

//поворот фигуры
	rotateFigure(currentThis)
	{
		var gotostate = currentThis.current_figure.stateNumber + 1;
		if (gotostate == 4){gotostate = 0};

		if (currentThis.testFigurePlace(0,0,currentThis.current_figure.figure.states[gotostate],currentThis))
		{
			for (var i=currentThis.current_figure.location.x; i<=currentThis.current_figure.location.x+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber].length; i++)
				{
					for (var j=currentThis.current_figure.location.y; j<=currentThis.current_figure.location.y+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber][0].length; j++)
					{
						if (currentThis.glassStateArray[i][j]=="1"){currentThis.glassStateArray[i][j]="0";}
					}
				}
			currentThis.current_figure.stateNumber=gotostate;
			currentThis.current_figure.state=currentThis.current_figure.figure.states[gotostate];
			for (var i=currentThis.current_figure.location.x; i<currentThis.current_figure.location.x+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber].length; i++)
				{
					for (var j=currentThis.current_figure.location.y; j<currentThis.current_figure.location.y+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber][0].length; j++)
					{
						if (currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber][i-currentThis.current_figure.location.x][j-currentThis.current_figure.location.y]=="1"){currentThis.glassStateArray[i][j]="1";}
					}
				}	
		}

	}

//Функция движения влево
		moveLeft(currentThis)
		{
//проверка возможности размещения фигуры
			if(currentThis.testFigurePlace(0,-1,currentThis.current_figure.state,currentThis))
//движение влево
			{
				for (var i=currentThis.current_figure.location.x; i<=currentThis.current_figure.location.x+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber].length; i++)
				{
					for (var j=currentThis.current_figure.location.y; j<=currentThis.current_figure.location.y+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber][0].length; j++)
						{
							if (currentThis.glassStateArray[i][j]=="1")
							{
								currentThis.glassStateArray[i][j]="0";
								currentThis.glassStateArray[i][j-1]="1";
							}
						}	
			}	
			currentThis.current_figure.location.y--;
			}

		}
//Функция движения вправо
		moveRight(currentThis)
		{
//проверка возможности размещения фигуры
			if(currentThis.testFigurePlace(0,1,currentThis.current_figure.state,currentThis))
//движение вправо
			{
				for (var i=currentThis.current_figure.location.x+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber].length; i>=currentThis.current_figure.location.x; i--)
				{
					for (var j=currentThis.current_figure.location.y+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber][0].length; j>=currentThis.current_figure.location.y; j--)
						{
							if (currentThis.glassStateArray[i][j]=="1")
							{
								currentThis.glassStateArray[i][j]="0";
								currentThis.glassStateArray[i][j+1]="1";
							}
						}	
			}	
			currentThis.current_figure.location.y++;
			}

		}
//Функция автоматического опускания фигуры по таймеру
		fall(currentThis)
		{
		currentThis.fall_countdown=0;
//опускание фигуры если это возможно...
		if (currentThis.testFigurePlace(1,0,currentThis.current_figure.state,currentThis))
		{
			for (var i=currentThis.current_figure.location.x+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber].length; i>=currentThis.current_figure.location.x; i--)
			{
				for (var j=currentThis.current_figure.location.y+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber][0].length; j>=currentThis.current_figure.location.y; j--)
					{
						if (currentThis.glassStateArray[i][j]=="1")
						{
							currentThis.glassStateArray[i+1][j]="1";
							currentThis.glassStateArray[i][j]="0";
						}
					}	
			}
		} 
//...смена состояния фигуры и установка флага на создание новой в случае если нет
		else
		{
			currentThis.figureNeeded=true;
			for (var i=currentThis.current_figure.location.x+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber].length; i>=currentThis.current_figure.location.x; i--)
			{
				for (var j=currentThis.current_figure.location.y+currentThis.current_figure.figure.states[currentThis.current_figure.stateNumber][0].length; j>=currentThis.current_figure.location.y; j--)
					{
						if (currentThis.glassStateArray[i][j]=="1")
						{
							currentThis.glassStateArray[i][j]="2";
						}
					}	
			}
		
//проверка на заполненные ряды
			currentThis.checkFilledRows(currentThis);
			}
			currentThis.current_figure.location.x++;
			currentThis.renderer.draw(currentThis.glassStateArray);
			if ((currentThis.instantFall)&&(currentThis.current_figure.location.x<currentThis.GLASS_HIGHT_BRICKS)){currentThis.fall(currentThis);}
		}
/*
███╗   ███╗ ██████╗ ██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗
████╗ ████║██╔═══██╗██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
██╔████╔██║██║   ██║██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝  
*/	
	gameOver(flag)
	{
		currentThis.state = "gameover";
		currentThis.glassObject.removeEventListener("controls:activate",function(e) {
			activateListenerActions(e.detail.action);
		});
		currentThis.glassObject.removeEventListener("controls:deactivate",function(e) {
			deactivateListenerActions(e.detail.action);
		});
		console.log("Worked");
		if (flag)
		{
			 ctx =currentThis.glassObject.getContext('2d');
			ctx.clearRect(0, 0, currentThis.glassObject.width, currentThis.glassObject.height);
			ctx.font = "30px Arial";
			ctx.fillText("Game Over",10,50);
		}
	}

//Установка игры на паузу и снятие её с паузы в зависимости от переданного параметра
	 setPaused(_paused)
	{
		currentThis.is_paused=!currentThis.is_paused;
		if (!currentThis.is_paused)
		{
			gamestep();
		}
	}

//Возвращает стоит ли игра на паузе или нет
	 isPaused()
	{

	}

//Возвращает текущий результат игры
	setScore(currentThis)
	{
		currentThis.pointContainer.innerHTML = "Ваши очки "+currentThis.score;
	}

//проверка заполненности рядов
	checkFilledRows(currentThis)
	{
		var rowFlag;
		for (var i=currentThis.GLASS_HIGHT_BRICKS; i>=0;i--)
		{
			rowFlag = true;
			for (var j=currentThis.GLASS_WIDTH_BRICKS; j>=0;j--)	
			{
				if (currentThis.glassStateArray[i][j]=="0")
				{
					rowFlag=false;
				}
			}
			if (rowFlag)
			{
				dragDown(i);
				currentThis.fall_delta=currentThis.fall_delta-25;
				currentThis.score++;
				currentThis.setScore(currentThis);
				i++;
			}
		}
//Опускание содержимого стакана
		function dragDown(row)
		{
			for (var i=row; i>=0;i--)
			{
				for (var j=currentThis.GLASS_WIDTH_BRICKS; j>=0;j--)	
				{
					currentThis.glassStateArray[i][j]=currentThis.glassStateArray[i-1][j];
					
				}
			}
		}
	}
}

/*
███████╗██╗   ██╗███████╗███╗   ██╗████████╗███████╗
██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
█████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ╚════██║
███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ███████║
╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝                                                                                                  
*/

//Генератор событий начала игры
function generateGameStartEvent(object)
{
	 event = new CustomEvent("tetrisGameStartEvent",
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
	 event = new CustomEvent("tetrisGamePauseEvent");
	document.dispatchEvent(event);		
}

//Генератор событий конца игры
function generateGameOverEvent()
{
	 event = new CustomEvent("tetrisGameOverEvent");
	document.dispatchEvent(event);	
}
//598