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
		//создание стакана в PIXI
		this.container=this.containers[0];
		this.glass = new PIXI.Application({width: params.GLASS_WIDTH, height: params.GLASS_HIGHT});
		this.container.appendChild(this.glass.view);
		//массив спрайтов
		this.brickArray=[[],[]];
		this.glass.renderer.backgroundColor = 0x009900;
		//контейнер эмиттеров
		this.emitterContainer = new PIXI.Container();
		this.emitterContainer.height = this.GLASS_HIGHT;
		this.emitterContainer.width = this.GLASS_WIDTH;
		
		//переменная для очистки пр геймовере
		this.destroyLineNumber=0;

		this.boundEmitAtPoint=this.emitAtPoint.bind(this);


		var boundSetup = this.setup.bind(this);
		PIXI.loader
			.add([
				"img/block_blue.png",
				"img/block_yellow.png",
				"img/block_red.png",
				"sounds/turn.mp3",
				"sounds/remove.mp3"
				])
			.load(boundSetup)
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
		if(state=="playing")
		{
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
		function animate()
		{
			for (var i=0; i<listOfBricks.length;i++)
			{
				listOfBricks[i].y= listOfBricks[i].y+speed;
			}	
			repeats--;
			if (repeats!=0)
			{
				setTimeout(boundAnimate,8);
			}
			if (repeats==0)
			{
				for (var i=0; i<listOfBricks.length;i++)
				{
					if(listOfEmits[i]==true){
						this.boundEmitAtPoint(listOfBricks[i].x+Math.floor(this.brickWidth/2),listOfBricks[i].y+this.brickHight,"img/block_red.png");
						}
					listOfBricks[i].destroy();
				}
			}
		}
	}

	//анимация конца игры
	animateGameover()
	{	
		var boundDestroyLine = destroyLine.bind(this);
		this.destroyLineNumber=0;
		setTimeout(boundDestroyLine,30);

		function destroyLine()
		{
			var i=this.destroyLineNumber;
			console.log(this.brickArray);
			console.log(i);
			for (var j=0; j<this.GLASS_WIDTH_BRICKS;j++)
			{
				if (this.brickArray[i][j].visible)
				{
					this.brickArray[i][j].visible=false;
					this.boundEmitAtPoint(j*this.brickWidth+Math.floor(this.brickWidth/2),i*this.brickHight+Math.floor(this.brickHight/2),"img/block_blue.png");
				}
			}
			this.destroyLineNumber++;
			if (this.destroyLineNumber<this.GLASS_HIGHT_BRICKS)
			{
				setTimeout(boundDestroyLine,60);
			}
		}
	}

	emitAtPoint(x,y,pic)
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
				"frequency": 0.001,
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
		var sound = PIXI.sound.Sound.from(PIXI.loader.resources["sounds/"+sound+".mp3"]);
		sound.play();
	}
}