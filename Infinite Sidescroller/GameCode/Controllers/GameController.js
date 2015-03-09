var CameraController, PlayerController, KeyboardController, WorldController, GraphicsController;
var GameModel;


PlayerController = require("./PlayerController.js");

KeyboardController = require("./KeyboardController.js");
WorldController = require("./WorldController.js");
GraphicsController = require("./GraphicsController.js");

GameModel = require("../Models/GameModel.js");

var GameController = (function(){


	var update_all = function(event){
		/*
		 * main function pretty much
		 * everyghing else is called from here every tick
		 */
		
		CameraController = require("./CameraController.js");

		var delta = event.delta;

		// !!!! world simulation step goes somewhere right here
		// as per current design, will take delta as an argument

		
		//TerrainController.generate_terrain(); 
		PlayerController.update();
		
		WorldController.update(delta);

		GraphicsController.update();
		
		// Should be called after all movement of objects is done:
		CameraController.update(); // should be moved to Graphics Model/Controller

		GameModel.stage.update(); // should be moved to Graphics Model/Controller
	};



	

	return {
		update_all: update_all,
	};

})();

module.exports = GameController;
