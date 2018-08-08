class keyboardController
{
	constructor(actions_to_bind, target)
	{
//массив с кодами нажатых кнопок
		this.pressedKeys=[];
		this.keys=[];
		this.actions=[]
		this.touchActions=[];
		if (target!=undefined){this.attach(target);}
		if (actions_to_bind!=undefined){this.bindActions(actions_to_bind);}
		this.boundCreateControlsActivateEvent=this.createControlsActivateEvent.bind(this);
		this.boundCreateControlsDeactivateEvent=this.createControlsDeactivateEvent.bind(this);
		this.boundTouchClickStart=this.touchClickStart.bind(this);
		this.boundTouchClickEnd=this.touchClickEnd.bind(this);
		this.enabled=true;
		this.focused=true;

		this.currentTouchX;
		this.currentTouchY;

		this.targetIsString=false;
	}

//Добавляет в контроллер переданные активности
	bindActions(actions_to_bind){
		if( Array.isArray( actions_to_bind ) ){
			for (var i = 0, len = actions_to_bind.length; i < len; i++) {
				if (actions_to_bind[i].keys!=undefined){this.addKeys(actions_to_bind[i]);}
				this.actions.push(actions_to_bind[i]);
				if (actions_to_bind[i].coords!=undefined){this.touchActions.push(actions_to_bind[i]);}
			}	
		}else{
			this.actions.push( actions_to_bind );
			if (actions_to_bind.coords!=undefined){this.touchActions.push(actions_to_bind);}
			else{
			this.addKeys( actions_to_bind );
			}	
		}
	}

//Добавление действий в массив кнопок
	addKeys(action)
	{
		for (var i = 0, len = action.keys.length; i < len; i++) {
			if (this.keys[action.keys[i]]==undefined) {this.keys[action.keys[i]]=[];}
			this.keys[action.keys[i]].push(action.name);
		}
	}

//Получение ссылки на действие по названию
	getActionByName( action_name ){
		for (var i = 0, len = this.actions.length; i < len; i++) {
			var _action = this.actions[i];
			if ( _action.name == action_name ) return _action;
		}
		return null;
	}

//Активирует объявленную активность - включает генерацию событий для этой активности и проверку по проверке через isActionActive
	enableAction( action_name )
	{
		var _action = this.getActionByName( action_name );
		if( _action ) {
			_action.active = true;
			return true;
		}
		return false;
	}

//Деактивирует объявленную активность - выключает генерацию событий для этой активности и при проверке через isActionActive возвращает false
	disableAction( action_name )
	{
		var _action = this.getActionByName( action_name );
		if( _action ) {
			_action.active = false;
			return true;
		}
		return false;
	}

//Создание события на нажатие клавиши
	createControlsActivateEvent(action){
		var keyCode=action.keyCode;
		this.pressedKeys[keyCode]=true;
		if ((this.enabled)&&(this.keys[keyCode]!=undefined)){
			var elem=this.getElement();
			for (var i = 0, len = this.keys[keyCode].length; i < len; i++)
			{
				var _action = this.getActionByName( this.keys[keyCode][i] );
				if (_action.active)
				{
					var activationEvent = new CustomEvent("controls:activate", {
					detail: {
								action: this.keys[keyCode][i]
							}
							});
					var elem=this.getElement();
					elem.dispatchEvent(activationEvent);
				}
			}	
		}
	}

//Создание события на отжатие клавиши
	createControlsDeactivateEvent(action){
		var keyCode=action.keyCode;
		this.pressedKeys[keyCode]=false;
		if ((this.enabled)&&(this.keys[keyCode]!=undefined)){
			var elem=this.getElement();
			for (var i = 0, len = this.keys[keyCode].length; i < len; i++)
			{
				var _action = this.getActionByName( this.keys[keyCode][i] );
				if (_action.active)
				{
					var deactivationEvent = new CustomEvent("controls:deactivate", {
					detail: {
								action: this.keys[keyCode][i]
							}
							});
					var elem=this.getElement();
					elem.dispatchEvent(deactivationEvent);
				}
			}	
		}
	}

//обработчик начала касания
	touchClickStart(event){
		if (event.type=="touchstart")
		{
			var touchobj = event.changedTouches[0]
			this.currentTouchX=touchobj.pageX;
			this.currentTouchY=touchobj.pageY;
		}
		if (event.type=="mousedown")
		{
			this.currentTouchX=event.pageX;
			this.currentTouchY=event.pageY;
			event.preventDefault();
		}

	}

//Обработчик события конца кaсания и генератор соответствующих событий
	touchClickEnd(event){
		if (event.type=="touchend")
		{
			var type = "touch";
			var touchobj = event.changedTouches[0]
			var changeX = this.currentTouchX-touchobj.pageX;
			var changeY = this.currentTouchY-touchobj.pageY;
		}
		if (event.type=="mouseup")
		{
			var type = "click";
			var changeX = this.currentTouchX-event.pageX;
			var changeY = this.currentTouchY-event.pageY;
		}

		for (var i = 0, len = this.touchActions.length; i < len; i++) {
			if ((changeX<this.touchActions[i].coords[0])&&(changeX>this.touchActions[i].coords[1])&&(changeY<this.touchActions[i].coords[2])&&(changeY>this.touchActions[i].coords[3])&&(type==this.touchActions[i].type))
			{
				var swipeEvent = new CustomEvent("controls:swipe", {
					detail: {
								action: this.touchActions[i].name
							}
					});
				var elem = this.getElement();
				elem.dispatchEvent(swipeEvent);
			}
		}
	}

//Нацеливает контроллер на переданный DOM-елемент (вешает слушатели).
	attach(target){
		if (typeof target== 'string') 
		{
			this.target=target;
			var elem=document.querySelector("#"+target);
			this.TargetIsString = true;
		}
		else
		{
			this.target=target;
			var elem=target;
		}
		elem.classList.add("keyboardController");
    	document.addEventListener("keydown", this.boundCreateControlsActivateEvent, false);
		document.addEventListener("keyup", this.boundCreateControlsDeactivateEvent, false);
		document.addEventListener("touchstart",this.boundTouchClickStart,false);
		document.addEventListener("touchend",this.boundTouchClickEnd,false);
		document.addEventListener("mousedown",this.boundTouchClickStart,false);
		document.addEventListener("mouseup",this.boundTouchClickEnd,false);
    }

//Отцепляет контроллер от активного DOM-елемента и деактивирует контроллер.
	detach(){
		var elem = this.getElement();
		elem.classList.remove("keyboardController");
		document.removeEventListener("keydown", this.boundCreateControlsActivateEvent);
		document.removeEventListener("keyup", this.boundCreateControlsDeactivateEvent);
		document.removeEventListener("touchstart",this.boundTouchClickStart,false);
		document.removeEventListener("touchend",this.boundTouchClickEnd,false);
		document.removeEventListener("mousedown",this.boundTouchClickStart,false);
		document.removeEventListener("mouseup",this.boundTouchClickEnd,false);
	}

//Проверяет активирована ли переданная активность в контроллере (зажата ли одна из соотвествующих этой активности кнопок)
	isActionActive(action){
		var result=false;
		for (var i = 0, len = this.actions.length; i < len; i++) {
 		 	if((this.actions[i].name==action)&&(this.actions[i].active==true)){result=true};
		}
		return result;
	}

//Проверяет нажата ли переданная кнопка в контроллере
	isKeyPressed(key){
		var result=this.pressedKeys[key];
		if (result==undefined)
			{
				result=false;
			}
		return result;
	}

	getElement()
	{
	if(this.targetIsString)
		{
			return document.querySelector("#"+this.target);
		}
		else
		{
			return this.target;
		}	
	}

}