class Tetris{
/*
 ██████╗ ██████╗ ███╗   ██╗███████╗████████╗██████╗ ██╗   ██╗ ██████╗████████╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝
██║     ██║   ██║██╔██╗ ██║███████╗   ██║   ██████╔╝██║   ██║██║        ██║   
██║     ██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══██╗██║   ██║██║        ██║   
╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   ██║  ██║╚██████╔╝╚██████╗   ██║   
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝  
*/
	constructor(params)
	{
		//Размеры стакана
		this.GLASS_WIDTH = params.GLASS_WIDTH || 360;
		this.GLASS_HIGHT = params.GLASS_HIGHT || 600;
		this.GLASS_HIGHT_BRICKS = params.GLASS_HIGHT_BRICKS || 20;
		this.GLASS_WIDTH_BRICKS = params.GLASS_WIDTH_BRICKS || 10;
		//Создание массива фигур
		this.figures=params.FIGURES || ["1,1,0;0,1,1","0,1,1;1,1,0","1,1;1,1","1,0,0;1,1,1","0,0,1;1,1,1","0,1,0;1,1,1","1,1,1,1","0,1,0;1,1,1;0,1,0"];
		//Размеры "кирпичей"
		this.brickHight=Math.floor(this.GLASS_HIGHT/this.GLASS_HIGHT_BRICKS);
		this.brickWidth=Math.floor(this.GLASS_WIDTH/this.GLASS_WIDTH_BRICKS);
		//хранения ID интеравла шага игры
		this.gameStepIntervalId;
		//данные задержек
		this.fallDeltaDefault = params.fallDelta|| 700;
		this.gameStepTimer = params.gameStepTimer || 40;
		//запись контейнера с счетом	
		this.pointContainer = document.getElementsByClassName(params.pointContainer)[0];
		//инициализация рендерера
		this.renderer= new PixiRenderer(
		{
			'GLASS_WIDTH': this.GLASS_WIDTH,
			'GLASS_PREVIEW_SECTION_WIDTH': params.GLASS_PREVIEW_SECTION_WIDTH,
			'GLASS_HIGHT': this.GLASS_HIGHT,
			'GLASS_HIGHT_BRICKS': this.GLASS_HIGHT_BRICKS,
			'GLASS_WIDTH_BRICKS': this.GLASS_WIDTH_BRICKS,
			'brickWidth': this.brickWidth,
			'brickhight': this.brickHight,
			'containers' : params.container
		})
		//стейт машина
		this.stateMachine = new tetrisGameStateMachine;
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
		//объект следующей фигуры
		this.next_figure=JSON.parse(JSON.stringify(this.current_figure));
		//таймер то опускания фигуры
		this.fall_countdown;
		//количество очков
		this.score=0;
		//заполнение контейнера с очками	
		this.setScore(this);
		//массив фигур
		this.figureObjectArray=[];
		//Состояние паузы
		this.is_paused=false;
		//контроллер
		this.keycon= new keyboardController();
		//получение объекта поля из рендерера (для слушателей)	
		this.glassObject=document.getElementsByClassName(params.container)[0];
		//присоединение контроллера к стакану
		this.keycon.attach(this.glassObject);
		//если params.controls пуст то устанавливаются кнопки по умолчанию, если нет то из него
		if (params.controls==undefined)
		{
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
			//добавление тапов и свайпов
			addTouchToController("left",[Infinity,200,400,-400],this.keycon);
			addTouchToController("right",[-200,-Infinity,400,-400],this.keycon);
			addTouchToController("space",[400,-400,-200,-Infinity],this.keycon);
			addTouchToController("up",[50,-50, 50,-50],this.keycon);
			function addTouchToController(name,keys,keycon)
			{
				var key={
					name: name,
					coords: keys,
					active: true,
					type: "touch"
				};
				keycon.bindActions(key);
			}
		}
		else
		{
		//добавление управление из параметров, если они есть		
			for (var i=0; i<params.controls.length;i++)
				this.keycon.bindActions(params.controls[i]);
		}
		//инициализация массива фигур
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
					for (var k = 0, len2 = tempLineArray.length; k < len2; k++)
					{
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
//запуск слушателей
	startListeners()
	{
		var boundGameStart=this.gamestart.bind(this);
		var boundSetPaused=this.setPaused.bind(this);
		var boundGameOver=this.gameOver.bind(this);
		var boundActivateListenerActions =this.activateListenerActions.bind(this);
		var boundDeactivateListenerActions =this.deactivateListenerActions.bind(this);
		var boundTouchListenerActions =this.touchListenerActions.bind(this);
		//слушатель на событие начала игры
		document.addEventListener("tetrisGameStartEvent",boundGameStart);
		//слушатель на событие конца игры
		document.addEventListener("tetrisGameOverEvent",boundGameOver);
		//слушатель на событие паузы
		document.addEventListener("tetrisGamePauseEvent",boundSetPaused);
		//Слушатели на нажатие и отжатие клавиш	
		this.glassObject.addEventListener("controls:activate",
			boundActivateListenerActions);
		this.glassObject.addEventListener("controls:deactivate",
			boundDeactivateListenerActions);
		this.glassObject.addEventListener("controls:swipe",				boundTouchListenerActions);
	//отрисовка изначального экрана
	this.renderer.draw(0,0,{},this.glassStateArray, this.stateMachine.getState());
	}
/*
 ██████╗ ██████╗ ███╗   ██╗███████╗████████╗██████╗ ██╗   ██╗ ██████╗████████╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝
██║     ██║   ██║██╔██╗ ██║███████╗   ██║   ██████╔╝██║   ██║██║        ██║   
██║     ██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══██╗██║   ██║██║        ██║   
╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   ██║  ██║╚██████╔╝╚██████╗   ██║   
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝  
*/ 

	//начало игры
	gamestart()
	{	
		this.renderer.netAppear();
		//очистка интервала игры
		clearInterval(this.gameStepIntervalId);
		this.keycon.enabled=true;
		//установка статуса на playing. если он уже playing то машина установит resetting		
		this.stateMachine.setState("playing");
		var state=this.stateMachine.getState();
		//обнуление переменных управления
		this.leftActive=false;
		this.rightActive=false;
		this.downActive=false;
		this.instantFall=false;
		this.rotate=false;

		if (state=="playing")
		{
			this.score=0;
			this.setScore(this);
			this.is_paused=false;
			this.fall_delta=this.fallDeltaDefault;
			this.fall_countdown=0
			this.state="playing";
			this.current_figure.figure=[];
			this.next_figure.figure=[];
			this.figureNeeded=true;
			//инициализация массива стакана и перерисовка
			initialiseGlassArray(this.GLASS_HIGHT_BRICKS,this.GLASS_WIDTH_BRICKS,this);
			//Функция инициализации массива стакана
			function initialiseGlassArray(x,y,p){
			for (var i = -1; i < x+5 ; i++)
			{
				p.glassStateArray[i]=[];
				for (var j = -1; j < y ; j++)
				{
					p.glassStateArray[i][j]="0";
				}
			}
		}
		//установка интервала для шага игры
		this.gameStepIntervalId=setInterval(this.boundGameStep,this.gameStepTimer);
		}
		else
		{
			//перезагрузка в случае нажатия новой игры во время игры			
			if (state=="resetting")
			{
				this.renderer.destroyCurrentFigure(true);
				clearInterval(this.gameStepIntervalId);
				this.stateMachine.setState("inactive");
				this.gamestart();
			}
		}

	}

	//действия на нажатие кнопки
	activateListenerActions(event)
	{
		switch(event.detail.action)
		{
			case "down": this.downActive=true; break;
			case "space": if(this.stateMachine.getState()!="paused"){this.instantFallFunc(this)}break;
		}
	}

	//действия на отжатие кнопки
	deactivateListenerActions(event)
	{
		switch(event.detail.action)
		{
			case "left": this.leftActive=true; break;
			case "right": this.rightActive=true; break;
			case "down": this.downActive=false; break;
			case "up": this.rotate=true; break;
		}
	}
	touchListenerActions(event)
	{
		switch(event.detail.action)
		{
			case "left": this.leftActive=true; break;
			case "right": this.rightActive=true; break;
			case "space": if(this.stateMachine.getState()!="paused"){ this.instantFall=true; this.instantFallFunc(this)}break;
			case "up": this.rotate=true; break;
		}
	}

	//шаг игры
	gamestep()
	{	
		if(this.figureNeeded){this.createFigure(this);}
		this.fall_countdown=this.fall_countdown+40;
		//проверка таймера на падение и падение
		if ((this.fall_countdown>=this.fall_delta)||((this.fall_countdown>=(this.fall_delta/2))&&(this.downActive)))
		{
			if (this.testFigurePlace(1,0,this.current_figure.state,this))
			{
				this.current_figure.location.x++;
				this.fall_countdown=0;
				this.checkFilledRows(this);
			}
			else
			{
				//остановка фигуры в случае если падать некуда
				this.stopFigure(this);
			}
		}
		//движение влево
		if(this.leftActive)
		{
			if (this.testFigurePlace(0,-1,this.current_figure.state,this))
			{
				this.renderer.shiftCurrentFigure(-1);
				this.current_figure.location.y--;
				this.leftActive=false;
			}
		}
		//движение вправо
		if(this.rightActive)
		{
			if (this.testFigurePlace(0,1,this.current_figure.state,this))
			{
				this.renderer.shiftCurrentFigure(1);
				this.current_figure.location.y++;
				this.rightActive=false;
			}
		}

		this.renderer.currentFigureAccelerate(this.downActive);

		//поворот фигуры	
		if(this.rotate)
		{
			this.rotateFigure(this); 
			this.rotate=false;
		}
		//перерисовка
		this.renderer.draw(this.current_figure.location.x,this.current_figure.location.y, this.current_figure.state, this.glassStateArray, this.stateMachine.getState(),this.score);
	}

//Генерация фигуры
	createFigure(currentThis)
	{
		var figure=currentThis.next_figure;
		currentThis.current_figure=JSON.parse(JSON.stringify(figure));
		figure.figure = currentThis.figureObjectArray[Math.floor(Math.random() * currentThis.figureObjectArray.length)];
		figure.location.x=0;
		figure.location.y=Math.floor(currentThis.GLASS_WIDTH_BRICKS/2) - Math.floor(figure.figure.states[0][0].length/2);
		figure.stateNumber=0;
		figure.state = figure.figure.states[0];
		currentThis.figureNeeded = false;
		if (currentThis.current_figure.figure.length==0)
		{
			currentThis.figureNeeded=true;
			currentThis.createFigure(currentThis);
		}
		else
		{
			if (!this.testFigurePlace(0,0,currentThis.current_figure.state,currentThis)){generateGameOverEvent();}
			else
			{
				var realSpeed=Math.ceil(currentThis.fall_delta/40)*40;
				currentThis.renderer.drawCurrentFigure(currentThis.current_figure.state,currentThis.current_figure.location.x, currentThis.current_figure.location.y,realSpeed);
			}
		}
		currentThis.renderer.drawNextFigure(figure.state);
	}

	stopFigure(currentThis)
	{
		var currentGlassArray=this.glassStateArray;
		var figure=currentThis.current_figure;
		for (var i=0; i<figure.state.length;i++)
		{
			for (var j=0; j<figure.state[0].length;j++)
			{
				if (figure.state[i][j]=="1")
				{
					currentGlassArray[i+figure.location.x][j+figure.location.y]="2";
				}
			}
		}
		currentThis.fall_countdown=0;
		currentThis.figureNeeded=true;
		currentThis.renderer.playSound("land");
		currentThis.renderer.destroyCurrentFigure();
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
	 testFigurePlace(dx, dy, figure_state,currentThis)
	 {
		figure_state = figure_state; //|| currentThis.current_figure.state;
		var figureLength=figure_state[0].length;
		var figureHight=figure_state.length;
		for (var x = 0; x < figureHight;x++)
		{
			for (var y = 0; y < figureLength; y++)
			{
				if (Number(figure_state[x][y]) + Number(currentThis.glassStateArray[dx+x+currentThis.current_figure.location.x][dy+y+currentThis.current_figure.location.y]) > 2 ){
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
		var figure=currentThis.current_figure;
		var gotostate = figure.stateNumber + 1;
		if (gotostate == 4){gotostate = 0};

		if (currentThis.testFigurePlace(0,0,figure.figure.states[gotostate],currentThis))
		{
			figure.stateNumber=gotostate;
			figure.state=figure.figure.states[gotostate];
			currentThis.renderer.playSound("turn");
			currentThis.renderer.rotateFigure(figure.state);
		}
	}

//мгновенное падение
	instantFallFunc(currentThis)
	{
		currentThis.fall_countdown=0;
		var figure=currentThis.current_figure;
		var delta=1;
		while (currentThis.testFigurePlace(delta,0,currentThis.current_figure.state,currentThis)){delta++}
		delta--;	
		currentThis.renderer.animateInstantFall(figure.location.x,figure.location.y,figure.state,delta);

		figure.location.x=figure.location.x+delta;
		currentThis.stopFigure(currentThis);

		currentThis.figureNeeded=true;
		currentThis.checkFilledRows(currentThis);
	}

/*
███╗   ███╗ ██████╗ ██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗
████╗ ████║██╔═══██╗██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
██╔████╔██║██║   ██║██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝  
*/	
//конец игры
	gameOver()
	{
		this.renderer.netDisappear();
		this.renderer.destroyCurrentFigure();
		this.stateMachine.setState("gameover");
		this.keycon.enabled=false;
		clearInterval(this.gameStepIntervalId);
		this.renderer.animateGameover(this.score);
		this.renderer.updateScore(this.score);
		this.renderer.playSound("gameover");
	}

//Установка игры на паузу и снятие её с паузы в зависимости от переданного параметра
	setPaused()
	{
		this.stateMachine.setState("paused");
		var state= this.stateMachine.getState();
		if (state=="paused")
		{
			this.renderer.pauseCurrentFigure(state,this.fall_delta);
			clearInterval(this.gameStepIntervalId);
		}
		else
		{
			if(state=="playing")
			{
				this.gameStepIntervalId=setInterval(this.boundGameStep,this.gameStepTimer);
				this.renderer.pauseCurrentFigure(state,this.fall_delta);
			}
		}
	}

//Устанавливает текущий результат игры
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
				currentThis.renderer.animateRemoval(i);
				currentThis.renderer.playSound("remove");
				currentThis.fall_delta=currentThis.fall_delta-25;
				currentThis.score++;
				currentThis.setScore(currentThis);
				currentThis.renderer.updateScore(currentThis.score);
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

function generateSoundStateEvent()
{
	var event = new CustomEvent("tetrisSoundStateEvent");
	document.dispatchEvent(event);	
}

function generateEvent(event)
{
	var event = new CustomEvent(event);
	document.dispatchEvent(event);		
}
//598