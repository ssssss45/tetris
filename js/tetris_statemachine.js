class tetrisGameStateMachine
{
	constructor()
	{
		this.setState("inactive");
	}

	setState(new_state)
	{
		switch(new_state)
		{
			case "inactive": this.state=new_state; break;
			case "playing": if(this.state=="playing"){this.state="resetting"}else{ this.state=new_state;} break;
			case "gameover": this.state=new_state; break;
			case "resetting": this.state=new_state; break;
			case "paused": if(this.state=="paused"){this.state="playing"}else{this.state=new_state}; break;
		}
	}

	getState()
	{
		return this.state;
	}
}