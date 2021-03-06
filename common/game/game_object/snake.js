inherits(GameObject, Snake);

function Snake(_rep) {
	GameObject.call(this, _rep, 'Snake', Utils.hazard);	//no need to pass in colors since snake is never rendered!

	/** a snake based off a collection of body parts - x and y position represent the position of the head */
	/** the snake is not stored in the grid's map; instead is in a separate list that updates first. it's body parts are in the grid map. */

	//fields
	var scope = this;
	var length = _rep.defaultLength || 1;
	var bodyParts = new Queue();
	var dead = false;
	var totalSteps = 0;

	var playerNum = _rep.playerNum || 0;
	var startingConfig = Utils.startingInfo[playerNum];
	var direction = Utils.directions[startingConfig.direction];

	//init code
	(function() {
		for (var i = length - 1; i >= 0; i--) {
			var rep = {
				x: scope.getX() - i,	//todo: calc location based on direction
				y: scope.getY(),	//todo: calc location based on direction
				classification: Utils.hazard,
				snake: scope
			};
			var bodyPart = new BodyPart(rep);
			bodyParts.enqueue(bodyPart);
			Utils.grid.insertAt(bodyPart, rep.x, rep.y);
		}
	})();

	//public
	this.getCurrentLength = function() {
		return length;
	};

	this.isDead = function() {
		return dead;
	};

	this.getStatus = function() {
		return {
			dead: dead,
			length: length,
			speed: Utils.grid.getSpeed(),
			difficulty: Utils.grid.getDifficulty(),
			totalSteps: totalSteps
		};
	};

	this.updateDirection = function(keyCode) {
		if (keyCode > 0) {
			var requestedDirection = Utils.directions[keyCode];
			var oppositeKey = Utils.opposites[keyCode];
			var oppositeDirection = Utils.directions[oppositeKey];
			if (direction.x !== oppositeDirection.x || direction.y !== oppositeDirection.y) {
				direction = requestedDirection;
			}
		}
	};

	//@Override
	this.update = function(gridMap, spawnMap, width, height) {
		if (!dead) {
			var newPosition = this.getNewPosition(direction);
			var objAtPos = gridMap[newPosition.y * width + newPosition.x];
			dead = Utils.grid.isOutOfBounds(newPosition) ||
				(objAtPos && objAtPos.isHazard());

			if (!dead) {
				if (objAtPos && objAtPos.isPickup()) {
					handlePickup(objAtPos);
				}
				var tail = bodyParts.dequeue();
				bodyParts.enqueue(tail);
				Utils.grid.moveTo(tail, newPosition);
				this.translate(direction);
				totalSteps++;
			}
		} else {
			//game over or something...
		}
	};

	function handlePickup(obj) {
		if (obj instanceof BodyPart) {
			obj.joinSnake(scope);
			var tail = bodyParts.getTail();
			var pos = Utils.subtractVectors(tail.getPosition(), direction);
			Utils.grid.moveTo(obj, pos);
			bodyParts.push(obj);
			Utils.grid.createPellet();
			Utils.grid.increaseDifficulty();
			length++;
		}
	}
}