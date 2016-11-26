class Unlockable {
	constructor(cost){
		this.enabled = false;
		this.cost = cost;
		this.count = 0;
	}
	enable(){
		this.enabled = true;
	}
	increment(){
		this.count++;
	}
	getCost(){
		return this.cost;
	}
	getCount(){
		return this.count;
	}
}

class Clock extends Unlockable {
	constructor(...args){
		super(...args);
		this.name = clock;
	}

}