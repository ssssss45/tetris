class PixiRenderer
{
	constructor(params)	
	{
		this.GLASS_WIDTH= params.GLASS_WIDTH || 360;
		this.GLASS_HIGHT= params.GLASS_HIGHT || 600;
		this.GLASS_HIGHT_BRICKS= params.GLASS_HIGHT_BRICKS || 20;
		this.GLASS_WIDTH_BRICKS= params.GLASS_WIDTH_BRICKS || 10;
		this.brickWidth= params.brickWidth || Math.floor(this.GLASS_WIDTH/this.GLASS_WIDTH_BRICKS);
		this.brickHight= params.brickHight || Math.floor(this.GLASS_HIGHT/this.GLASS_HIGHT_BRICKS);
		this.containers = document.getElementsByClassName(params.containers);
		//размер боковой секции
		this.GLASS_PREVIEW_SECTION_WIDTH=params.GLASS_PREVIEW_SECTION_WIDTH;
		//создание стакана в PIXI
		this.container=this.containers[0];
		this.glass = new PIXI.Application({width: params.GLASS_WIDTH+params.GLASS_PREVIEW_SECTION_WIDTH, height: params.GLASS_HIGHT});
		this.container.appendChild(this.glass.view);
		//массив спрайтов
		this.brickArray=[[],[]];
		this.glass.renderer.backgroundColor = 0x969696;//0x009900;
		//контейнер эмиттеров
		this.emitterContainer = new PIXI.Container();
		this.emitterContainer.height = this.GLASS_HIGHT;
		this.emitterContainer.width = this.GLASS_WIDTH;
		//массив блоков для отображения следующей фигуры
		this.nextFigureBlocks=[];

		//Состояние звука
		this.soundOn=true;
		
		//переменная для очистки при геймовере
		this.destroyLineNumber=0;

		this.boundEmitAtPoint=this.emitAtPoint.bind(this);
		//текст
		this.text=new PIXI.Text('TETRIS',
			{
				fontFamily : 'Courier New', 
				fontSize: Math.floor(this.GLASS_HIGHT/7), 
				fill : 0x000000, 
				align : 'center',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2
			});
		this.glass.stage.addChild(this.text);

		//текст для секции следующей фигуры
		this.nextFiguretext=new PIXI.Text('Следующая\nфигура:',
			{
				fontFamily : 'Courier New', 
				fontSize: Math.floor(this.GLASS_PREVIEW_SECTION_WIDTH/6), 
				fill : 0x000000, 
				align : 'right',
				"dropShadow": true,
				"dropShadowDistance": 10,
				"dropShadowAlpha": 0.2,
			});
		this.nextFiguretext.x=this.GLASS_WIDTH+6;
		this.nextFiguretext.y=Math.floor(this.GLASS_HIGHT/3*2);
		this.glass.stage.addChild(this.nextFiguretext);

		//разделитель
		this.line = new PIXI.Graphics();
		this.line.lineStyle(4, 0xFFFFFF, 1);
		this.line.moveTo(this.GLASS_WIDTH+2,0);
		this.line.lineTo(this.GLASS_WIDTH+2, this.GLASS_HIGHT);
		this.glass.stage.addChild(this.line);

		//поле для отрисовки следующей фигуры
		this.previewRectangle = new PIXI.Graphics();
		this.previewRectangle.beginFill(0xFFFFFF);
		this.previewRectangle.drawRect(0, 0, this.GLASS_PREVIEW_SECTION_WIDTH-10, this.GLASS_PREVIEW_SECTION_WIDTH-10);
		this.previewRectangle.endFill();
		this.previewRectangle.x = this.GLASS_WIDTH+6;
		this.previewRectangle.y = Math.floor(this.GLASS_HIGHT/3*2)+40;
		this.glass.stage.addChild(this.previewRectangle);

		var boundSetup = this.setup.bind(this);
		PIXI.loader
			.add([
				"img/block_blue.png",
				"img/block_yellow.png",
				"img/block_red.png",
				"sounds/turn.mp3",
				"sounds/remove.mp3",
				"sounds/gameover.mp3",
				"sounds/land.mp3",
				"sounds/button.mp3"
				])
			.load(boundSetup)

		//слушатель на отключение звука
		var boundChangeSoundState=this.changeSoundState.bind(this);
		document.addEventListener("tetrisSoundStateEvent",
		boundChangeSoundState);
		//слушатели на события нажатия кнопок (для звуков)
		this.boundPlayButtonSound=this.playButtonSound.bind(this);
		document.addEventListener("tetrisGameStartEvent",
		this.boundPlayButtonSound);
		document.addEventListener("tetrisGamePauseEvent",
		this.boundPlayButtonSound);
	}
	//заполнение стакана спрайтами
	setup()
	{
		for (var i=0; i<this.GLASS_HIGHT_BRICKS; i++)
		{
			this.brickArray[i]=[];
			for (var j=0; j<this.GLASS_WIDTH_BRICKS; j++)
			{
				this.brickArray[i][j] = new PIXI.Sprite(PIXI.loader.resources["img/block_blue.png"].texture);
				this.brickArray[i][j].width=this.brickWidth;
				this.brickArray[i][j].height=this.brickHight;
				this.brickArray[i][j].y=i*this.brickHight;
				this.brickArray[i][j].x=j*this.brickWidth;
				this.brickArray[i][j].visible= false;
				this.glass.stage.addChild(this.brickArray[i][j]);
			}
		}
		this.glass.stage.addChild(this.emitterContainer);
	}
	//отрисовка поля
	draw(figureX,figureY,figure,glassStateArray,state,points)
	{
		if (state=="inactive")
		{
			this.text.fontSize=84;
			this.text.visible=true;
			this.text.text="TETRIS";
		}
		if(state=="playing")
		{
			this.text.visible=false;
			for (var i = 0; i < this.GLASS_HIGHT_BRICKS; i++)
			{
				for (var j = 0; j < this.GLASS_WIDTH_BRICKS; j++)
				{
					if(glassStateArray[i][j]=="2")
					{
						this.brickArray[i][j].visible=true;
					}
					else
					{
						if(glassStateArray[i][j]=="0")
						{
							this.brickArray[i][j].visible=false;
						}
					}	
				}	
			}
			if (figure!= {})
			{
				for (var i = 0; i <figure.length; i++)
				{
					for (var j = 0; j <  figure[0].length; j++)
					{
						if(figure[i][j]=="1")
						{	
							this.brickArray[i+figureX][j+figureY].visible=true;
						};
					};
				}
			}
		}
	}

	//отрисовка следующей фигуры
	drawNextFigure(figure)
	{
		for (var i=0;i<this.nextFigureBlocks.length;i++)
		{
			this.nextFigureBlocks[i].destroy();
		}
		this.nextFigureBlock=[];
		var drawAtX=this.previewRectangle.x+5;
		var drawAtY=this.previewRectangle.y+5;
		var brickHight=Math.floor((this.previewRectangle.height-10)/figure.length);
		var brickWidth=Math.floor((this.previewRectangle.width-10)/figure[0].length);
		var brickSquareSize=Math.min(brickHight,brickWidth);
		for (var i=0;i<figure.length;i++)
		{
			for (var j=0;j<figure[0].length;j++)	
			{
				if (figure[i][j]=="1")
				{
					var brick=new PIXI.Sprite(PIXI.loader.resources["img/block_blue.png"].texture);
					brick.width=brickSquareSize;
					brick.height=brickSquareSize;
					brick.y=drawAtY+i*brickSquareSize;
					brick.x=drawAtX+j*brickSquareSize;
					this.glass.stage.addChild(brick);
					this.nextFigureBlocks.push(brick);	
				}
				
			}
		}
	}

	//анимация убирания ряда
	animateRemoval(line)
	{
		var listOfBricks=[];
		for (var i=0; i<this.GLASS_WIDTH_BRICKS;i++)
		{
			var brick=new PIXI.Sprite(PIXI.loader.resources["img/block_yellow.png"].texture);
			brick.width=this.brickWidth;
			brick.height=this.brickHight;
			brick.y=line*this.brickHight;
			brick.x=i*this.brickWidth;
			this.glass.stage.addChild(brick);
			listOfBricks.push(brick);	
		}
		var repeats=Math.floor((this.GLASS_HIGHT-line*this.brickHight)/10);
		var boundAnimate = animate.bind(this);
		var speedX = -3;
		var speedY = -20;
		setTimeout(boundAnimate,30);
		function animate()
		{
			for (var i=0; i<this.GLASS_WIDTH_BRICKS;i++)
			{
				listOfBricks[i].y= listOfBricks[i].y+speedY;
				listOfBricks[i].x= listOfBricks[i].x+speedX;
			}	
			speedY=speedY+3;
			if (listOfBricks[0].y<this.GLASS_HIGHT)
			{
				setTimeout(boundAnimate,30);
			}
			else
			{
				for (var i=0; i<this.GLASS_WIDTH_BRICKS;i++)
				{
					listOfBricks[i].destroy();
				}
			}
		}
	}

	//анимация мгновенного падения
	animateInstantFall(figureX,figureY,figure,delta)
	{
		var listOfBricks=[];
		var listOfEmits=[];
		for (var i = 0; i <figure.length; i++)
		{
			for (var j = 0; j <  figure[0].length; j++)
			{
				if(figure[i][j]=="1")
				{	
					var brick=new PIXI.Sprite(PIXI.loader.resources["img/block_red.png"].texture);
					brick.width=this.brickWidth;
					brick.height=this.brickHight;
					brick.y=(figureX+i)*this.brickHight;
					brick.x=(figureY+j)*this.brickWidth;
					if(figureX+i+delta+1<this.GLASS_HIGHT_BRICKS)
					{
						if(this.brickArray[figureX+i+delta+1][j+figureY].visible)
						{
							listOfEmits.push(true);
						}
						else
						{
							listOfEmits.push(false);
						}
					}
					this.glass.stage.addChild(brick);
					listOfBricks.push(brick);
					this.brickArray[i+figureX][j+figureY].visible=false;
				};
			};
		}

		var repeats=20;
		var speed=Math.floor((delta)*this.brickHight/repeats);

		var boundAnimate = animate.bind(this);
		setTimeout(boundAnimate,8);
		var temp=0;
		function animate()
		{
			for (var i=0; i<listOfBricks.length;i++)
			{
				listOfBricks[i].y= listOfBricks[i].y+speed;
			}	
			//прыжки блоков (пока не работает)
			for (var i = 0; i <this.GLASS_HIGHT_BRICKS; i++)
			{
				for (var j = 0; j <  this.GLASS_WIDTH_BRICKS; j++)
				{
					this.brickArray[i][j].y=this.brickArray[i][j].y-10+repeats;	
					
				};
			}
			repeats--;
			if (repeats!=0)
			{
				setTimeout(boundAnimate,8);
			}
			if (repeats==0)
			{
				console.log(temp);
				for (var i = 0; i <this.GLASS_HIGHT_BRICKS; i++)
				{
					for (var j = 0; j <  this.GLASS_WIDTH_BRICKS; j++)
					{
						this.brickArray[i][j].y=this.brickArray[i][j].y-10;	
					};
				}
				for (var i=0; i<listOfBricks.length;i++)
				{

					if(listOfEmits[i]==true){
						this.boundEmitAtPoint(listOfBricks[i].x+Math.floor(this.brickWidth/2),listOfBricks[i].y+this.brickHight,"img/block_yellow.png",0.001);
						}
					listOfBricks[i].destroy();
				}
			}
		}
	}

	//анимация конца игры
	animateGameover(score)
	{	
		var boundDestroyLine = destroyLine.bind(this);
		this.destroyLineNumber=0;
		setTimeout(boundDestroyLine,30);
		this.text.visible=true;
		this.text.scale.x=0.38;
		this.text.scale.y=0.38;
		this.text.alpha=0;
		this.text.text="Игра окончена! \n Ваш счет: "+score+" очков";
		function destroyLine()
		{
			var i=this.destroyLineNumber;
			for (var j=0; j<this.GLASS_WIDTH_BRICKS;j++)
			{
				if (this.brickArray[i][j].visible)
				{
					this.brickArray[i][j].visible=false;
					this.boundEmitAtPoint(j*this.brickWidth+Math.floor(this.brickWidth/2),i*this.brickHight+Math.floor(this.brickHight/2),"img/block_blue.png",0.01);
				}
			}
			this.destroyLineNumber++;
			if (this.destroyLineNumber<this.GLASS_HIGHT_BRICKS)
			{
				this.text.alpha=this.text.alpha+1/this.GLASS_HIGHT_BRICKS;
				setTimeout(boundDestroyLine,60);
			}
		}
	}

	emitAtPoint(x,y,pic,frequency)
	{
		var emit=new PIXI.particles.Emitter(
			this.emitterContainer,
			[PIXI.Texture.fromImage(pic)],
			{
				"alpha": {
					"start": 1,
					"end": 1
				},
				"scale": {
					"start": 0.1,
					"end": 0.01,
					"minimumScaleMultiplier": 1
				},
				"color": {
					"start": "#e4f9ff",
					"end": "#3fcbff"
				},
				"speed": {
					"start": 200,
					"end": 50,
					"minimumSpeedMultiplier": 1
				},
				"acceleration": {
					"x": 0,
					"y": 0
				},
				"maxSpeed": 0,
				"startRotation": {
					"min": 0,
					"max": 360
				},
				"noRotation": false,
				"rotationSpeed": {
					"min": 0,
					"max": 0
				},
				"lifetime": {
					"min": 0.2,
					"max": 0.3
				},
				"blendMode": "normal",
				"frequency": frequency,
				"emitterLifetime": 0.2,
				"maxParticles": 100,
				"pos": {
					"x": x,
					"y": y
				},
				"addAtBack": false,
				"spawnType": "circle",
				"spawnCircle": {
					"x": 0,
					"y": 0,
					"r": 20
				}
			}
		);
		emit.emit=true;
		emit.playOnceAndDestroy();	
	}

	playSound(sound)
	{
		if (this.soundOn)
		{
			var sound = PIXI.sound.Sound.from(PIXI.loader.resources["sounds/"+sound+".mp3"]);
			sound.play();	
		}
	}

	changeSoundState()
	{
		this.soundOn=!this.soundOn;
		this.playSound("button");
	}

	playButtonSound()
	{
		this.playSound("button");
	}
}