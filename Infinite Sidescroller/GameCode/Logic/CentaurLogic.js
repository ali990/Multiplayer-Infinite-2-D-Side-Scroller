var CentaurLogic = (function(){
   
	var Centaur = function(){
		/* Will be instantiated for every created entity to hold all the information 
			about the physical (not graphical) state of the entity in question. 
			declare the properties like entity:
			entity.some_state_variable_initial_value = 0;
			instantiate (most likely in the spawn function) like that:
			var new_entity_instance = new Centaur();
		*/
		var entity = EntityController.create_abstract_entity();
		
		entity.hero_hurt_me = false;
		entity.me_hurt_hero = false;
		entity.death_tick = 0;

		//set your game logic parameters here
		//entity.object_id = 1; //hardcode a unique identifier for each new enemy class
		entity.hp = 4;
		entity.speed = 4;
		entity.damage = 12;
		entity.point_value = 100;
		//entity.attack_cooldown = 4; //use entity for enemies who need
		entity.can_attack = true;//use entity for enemies who alternate between 
		//entity.cooldown_timer=-1;
		entity.AI_state = "walk";//use entity to keep track of the enemy's AI state
		entity.aliveflag = true;
		entity.unhurtflag = true;
		entity.needs_graphics_update = false;

		entity.direction = false;
		entity.jolt_force = 100;
		
		return entity;
	};

	var init = function(){
		/* Is ran from the EntityController.init once during game loading 
		 	you should assign type to your model here using the identification controller
		 */
		include(); // satisfy requirements, GOES FIRST
		IdentificationController.assign_type(Centaur, "Centaur");
	};

	var spawn = function(x, y){
		/* spawn instance of this entity at the given coordinates
			you will have to create new entity instance, assign it id
			using the IdentificationController.assign_id(entity_instance),
			assign it a body which you can get through PhysicsController
			do any other stuff you want to do during spawning,
			and finally you HAVE TO(!!!) return the instance you just created from this function
		*/

		var new_Centaur = new Centaur();
		new_Centaur.type = "Centaur";
		var id = IdentificationController.assign_id(new_Centaur);

		new_Centaur.body = PhysicsController.get_rectangular({x: x, y: y, border_sensors: true}, new_Centaur);	

		return new_Centaur;

	};

	var tick_AI = function(Centaur){
		/* Is ran each tick from the EntityController.update for every registered
			entity of this type. I given entity_instance
		*/

		//if dead, die
		if (Centaur.hp <= 0) {
			Centaur.die();
		}else{ // Centaur.hp >= 1
				Centaur.change_animation("walk");
			
			if (Centaur.animation == "walk"){
				Centaur.move(Centaur.speed);
			}
			if (Centaur.animation == "jolt"){
			    Centaur.jump((2 * Centaur.jolt_force * Centaur.direction) - Centaur.jolt_force, Centaur.jolt_force/2);
			}
			if (Centaur.hit_taken){
				Centaur.take_damage();
				Centaur.change_animation("injury");
			}
		}
	};

	// // //Set up Collision handler
	
	
	var begin_contact = function(contact, info){
		//handle collisions here
		
		if(info.Them.type == "hero"){
			if(info.Them.fixture_name != "bottom" && info.Me.entity.can_attack){
				info.Me.entity.me_hurt_hero = true;
			}else{
				info.Me.entity.hit_taken = true;//take damage if enemy collides from above and distance < vulnerability radius
				info.Me.entity.damage_taken = info.Them.entity.damage;
			}
		}
	};

	var end_contact = function(contact, info){
	
	};

	
	return {
		// declare public
		init: init, 
		spawn: spawn,
		tick_AI: tick_AI,
		begin_contact: begin_contact,
		end_contact: end_contact,
	};
})();

module.exports = CentaurLogic;

var Includes = require("../Includes.js"); var include_data = Includes.get_include_data({
	current_module: "CentaurLogic", 
	include_options: Includes.choices.LOGIC_SPECIFIC
}); eval(include_data.name_statements); var include = function(){eval(include_data.module_statements);}