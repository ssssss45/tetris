class CanvasRenderer
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
		console.log(this.containers);
		this.container=this.containers[0];

//добавление канваса поля
		this.fieldCanvas = document.createElement("canvas");
		this.fieldCanvas.height=this.GLASS_HIGHT;
		this.fieldCanvas.width=this.GLASS_WIDTH;
		this.fieldCanvas.style="position: absolute;";
		this.container.appendChild(this.fieldCanvas);


//добавление канваса сетки
		this.netCanvas = document.createElement("canvas");
		this.netCanvas.height=this.GLASS_HIGHT;
		this.netCanvas.width=this.GLASS_WIDTH;
		this.netCanvas.style="position: absolute;";
		this.container.appendChild(this.netCanvas);

		this.drawNet();
	}
//отрисовка стакана
	draw(glassStateArray)
	{
		var flag=true;
		var ctx = this.fieldCanvas.getContext('2d');
		for (var i = 0; i < this.GLASS_WIDTH_BRICKS; i++)
		{
			for (var j = 0; j < this.GLASS_HIGHT_BRICKS; j++)
			{
				ctx.fillStyle = 'rgb(200, 0, 0)';
				if(glassStateArray[j][i]=="1")
				{
					ctx.fillRect(i*this.brickWidth, j*this.brickHight, this.brickWidth , this.brickHight);

				};
				ctx.fillStyle = 'rgb(200, 200, 0)';
				if(glassStateArray[j][i]=="0"){
					ctx.fillRect(i*this.brickWidth, j*this.brickHight, this.brickWidth , this.brickHight);
				};
				ctx.fillStyle = 'rgb(0, 100, 100)';
				if(glassStateArray[j][i]=="2"){
					ctx.fillRect(i*this.brickWidth, j*this.brickHight, this.brickWidth , this.brickHight);
				};
			}	
		}
        
	}
//Отрисовка сетки над стаканом	
	drawNet()
	{
		var ctx = this.netCanvas.getContext('2d');
		ctx.beginPath();
		for (var i = 0; i <= this.GLASS_WIDTH; i=i+this.brickWidth)
		{
				ctx.moveTo(i,0);
				ctx.lineTo(i,this.GLASS_HIGHT);
				ctx.stroke();
		}
		for (var j = 0; j <= this.GLASS_HIGHT; j=j+ this.brickHight)
		{
			ctx.moveTo(0,j);
			ctx.lineTo(this.GLASS_WIDTH,j);
			ctx.stroke();
		}
	}

	getField()
	{
		return(this.fieldCanvas);
	}
}