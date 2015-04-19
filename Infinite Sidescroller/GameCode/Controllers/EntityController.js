
var EntityController = (function(){
	/* Description
	*/

	var type_logic_table;

	var Count = 0;
	
	var init = function(){
		/* is ran from the InitController once when the game is loaded */

		include(); // satisfy requirements

		type_logic_table = {
			"ant": AntLogic,
			"hero": HeroLogic,
            "Griffin": GriffinLogic,
			"Hyena": HyenaLogic,
		};

		for(type in type_logic_table){
			var logic = type_logic_table[type];
			logic.init();

			if(logic.begin_contact){
				PhysicsController.listen_for_contact_with(type, "BeginContact", logic.begin_contact);
			}

			if(logic.end_contact){
				PhysicsController.listen_for_contact_with(type, "EndContact", logic.end_contact);
			}

			if(logic.pre_solve){
				PhysicsController.listen_for_contact_with(type, "PreSolve", logic.pre_solve);
			}

			if(logic.post_solve){
				PhysicsController.listen_for_contact_with(type, "PostSolve", logic.post_solve);
			}

		}

		spawn(10, 10, "hero");
	};

	var spawn = function(x, y, type){
		/**
		* spawn entity of the given type at the given coordinates
		* also registeres thing as awaiting graphics initialization
		*/
		var logic = type_logic_table[type];

		if(logic){
			var new_entity = logic.spawn(x, y);
			RegisterAsController.register_as("awaiting_graphics_initialization", new_entity)

			if(!EntityModel.for_logic_update[type]){
				EntityModel.for_logic_update[type] = {};
			}
			var logic_upd_table = EntityModel.for_logic_update[type];
			logic_upd_table[new_entity.id] =  new_entity;
		}else{
			throw "Logic for the type " + type + " is not defined";
		}
		

	};

	var despawn = function(entity){
		/**
		 * this function will despawn given entity
		 * in one of two ways:
		 * if entity has despawn function, it will be called
		 * if not, entity will be deleted directly
		*/

		var type = entity.type;
		var id = entity.id;
		var logic = type_logic_table[type];

		if(logic.despawn){
			// if custom despawn function is provided, call it
			logic.despawn(entity);
			console.log("despawn called for the type", type);
		}else{
			// or delete directly
			delete_entity(entity);
		}

	};
	
	

	var delete_entity = function(entity){
		/**
		* This function will remove this entity along with some other info about this entity
		* from the world, it'll also free the id of this entity. The physical body will be deleted
		* too; 
		* This function is supposed to be called by the individual logic modules, when the are finished
		* animating deat/destruction of something and want to get rid of it
		*/

		// TODO: finish this function and then update it regularly;
		// This one is very sensitive, as even one reference left may prevent 
		// object from being deleted and cause memory leaks. Testing is required
		if(entity.body != null){
			var body = entity.body;
		}else{
			// body is required. if place where body is stored changed, you should update this function
			throw "Body of the instance is undefined"
		}

		if(entity.id != null){
			var id = entity.id;
		}else{
			// id is needed, if id system changed, and you are here, update this function
			throw "There is no id associated with this instance"
		}

		if(entity.type != null){
			var type = entity.type;
		}else{
			// id is needed, if id system changed, and you are here, update this function
			throw "There is no type associated with this instance"
		}

		// remove graphics
			//GraphicsController.destroy_graphics_for(id);
			RegisterAsController.register_as("removed_entity", entity);
		// remove physics
			PhysicsController.remove_body(body);
		// remove stored references within EntityController/Model
			delete EntityModel.for_logic_update[type][id];
		// free the id
			IdentificationController.remove_id(id);
	};

	var update = function(delta){
		/* is ran each tick from the GameController.update_all */
		var debug_commands = KeyboardController.debug_commands();

		// demonstration purposes for ant
		if(debug_commands("spawn_ant")){
		    var new_ant = spawn(Config.Player.movement_edge + Math.random() * 50, 10, "ant");
		}

	    // demonstration purposes for griffin

		if (debug_commands("spawn_griffin") && Count > 5) {
		    var new_griffin = spawn(Math.random() * 50 + Config.Player.movement_edge, -20, "Griffin");
			Count = 0;
		}
		Count++;

		if (debug_commands("spawn_griffin")) {
		    var new_griffin = spawn(Math.random() * 50 + Config.Player.movement_edge, 10, "Griffin");
		}
		

	    // demonstration purposes for hyena
		if (debug_commands("spawn_hyena")) {
		    var new_hyena = spawn(Math.random() * 50 + Config.Player.movement_edge, 10, "Hyena");
		}

		for(var type in EntityModel.for_logic_update){
			var table = EntityModel.for_logic_update[type];

			var logic = type_logic_table[type];
			for(var id in table){
				var entity = table[id];

				if(beyond_world_boundary(entity)){
					// if outside boundaries of the world, despawn
					despawn(entity);
					console.log("entity of type", type, "deleted due to the world boundary");
				}else{
					// else tick its AI
					logic.tick_AI(entity);
				}
			}
			
		} // end for in 

	};

	var beyond_world_boundary = function(entity){
		/**
		* checks if the entity is beyond one of the world boundaries,
		*/
		var body = entity.body;
		return (body.GetWorldCenter().x < Config.Player.movement_edge ||
			body.GetWorldCenter().y > Config.World.maxy);

	};
	
	

	return {
		// declare public
		init: init, 
		update: update,
		delete_entity: delete_entity,

	};
})();

module.exports = EntityController;

var Includes = require("../Includes.js"); var include_data = Includes.get_include_data({
	current_module: "EntityController", 
	include_options: Includes.choices.DEFAULT | Includes.choices.LOGIC
}); eval(include_data.name_statements); var include = function(){eval(include_data.module_statements);}

