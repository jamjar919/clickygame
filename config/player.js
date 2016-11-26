	class player {
		constructor(id, socket){
			//generate random name.
			this.name = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
			this.socket = socket;
			this.id = id;
			this.counter = 0;
			this.unlockables = new unlockables(id);
			this.requirements = new unlockables_costs(id);
		}
		increment(number){
			this.counter = this.counter + number;
		}
		sendCounter(){
			this.socket.emit("send_counter_value", this.counter);
		}
		sendPlayerProperties(){
			this.socket.emit("player_properties", this.name);
		}
		sendUnlockableRequirements(){
			this.socket.emit("player_unlockable_requirements", this.requirements);
		}
	}

	// unlockables class
	function unlockables(id) {
		this.id = id;
		this.timer = false;
		this.multiplier = 1;
		this.check - false;
		this.clock_multiplier = 1000;
		this.clock_increment = 0.001;
		this.clock = false;

		this.incrementMultiplier = function(number){
			this.multiplier = number;
		}
	}

	//unlockables costs class
	function unlockables_costs(id){
		this.clock = 5;
		this.multiplier = 10;
		this.tenx = 1000;
		this.increaseClockCost = function(){
			this.clock = Math.pow(2.11/2, this.clock);
			// n = this.clock;
			// this.clock = (n^3 * (100-n))/(50);
		}
		this.increasetenxCost = function(){
			this.tenx = this.tenx ^ (3/2);
			// this.tenx = (n^3 * (150-n))/(50);
			// this.tenx = this.tenx * Math.log(this.tenx)/Math.log(10);
		}
	}
