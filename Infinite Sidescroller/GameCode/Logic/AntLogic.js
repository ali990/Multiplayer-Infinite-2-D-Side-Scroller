var AntLogic = (function(){

	var Ant = function(){
		/* Will be instantiated for every created entity to hold all the information 
			about the physical (not graphical) state of the entity in question. 
			declare the properties like this:
			this.some_state_variable_initial_value = 0;
			instantiate (most likely in the spawn function) like that:
			var new_entity_instance = new Ant();
		*/
	

		var entity = EntityController.create_abstract_entity();
		
		entity.hero_hurt_me = false;
		entity.me_hurt_hero = false;
		entity.death_tick = 0;
		entity.hp = 3;
		entity.speed = 3;
		entity.damage = 1;
		entity.point_value = 50;
		entity.can_attack = true;
		entity.aliveflag = true;
		entity.unhurtflag = true;
		entity.start_walking = true;
		entity.pop = 40;
		entity.popup = 0;
		entity.animation = "walk";
		entity.decay_duration = 0;
		
		return entity;
		
		/*
		this.hero_hurt_me = false;
		this.me_hurt_hero = false;
		this.death_tick = 0;

		//set your game logic parameters here
		//this.object_id = 1; //hardcode a unique identifier for each new enemy class
		this.hp = 3;
		this.speed = 3;
		this.damage = 1;
		this.point_value = 50;
		//this.attack_cooldown = 4; //use this for enemies who need
		this.can_attack = true;//use this for enemies who alternate between 
		//this.cooldown_timer=-1;
		this.AI_state = "walk";//use this to keep track of the enemy's AI state
		this.aliveflag = true;
		this.unhurtflag = true;
		this.start_walking = true;
		this.pop = 40;
		this.popup = 0;
		*/
	};

	var init = function(){
		/* Is ran from the EntityController.init once during game loading 
		 	you should assign type to your model here using the identification controller
		 */
		include(); // satisfy requirements, GOES FIRST
		IdentificationController.assign_type(Ant, "ant");
	};

	var spawn = function(x, y){
		/* spawn instance of this entity at the given coordinates
			you will have to create new entity instance, assign it id
			using the IdentificationController.assign_id(entity_instance),
			assign it a body which you can get through PhysicsController
			do any other stuff you want to do during spawning,
			and finally you HAVE TO(!!!) return the instance you just created from this function
		*/

		var new_ant = new Ant();
		new_ant.type = "ant";
		var id = IdentificationController.assign_id(new_ant);

		new_ant.body = PhysicsController.get_rectangular({x: x, y: y, border_sensors: true}, new_ant);	

		return new_ant;

	};

	var tick_AI = function(ant){
		/* Is ran each tick from the EntityController.update for every registered
			entity of this type. I given entity_instance
		*/

	    //if enemy is dead, die
		//if (ant.body.GetWorldCenter().y > 22 || ant.body.GetWorldCenter().x < Config.Player.movement_edge - 1) {
			//EntityController.delete_entity(ant);
			//console.log("drop of death");
		//}
		if (ant.hp == 1) {
			if (ant.hero_hurt_me){
				ant.take_damage(ant);
				ant.die(ant);
			}
		ant.popup++;
			if(ant.pop == ant.popup && ant.animation == "upside_down")
			{
				//var Antbody = ant.body;
				//Antbody.ApplyImpulse(new B2d.b2Vec2(10, -20), Antbody.GetWorldCenter());
				ant.jump(ant);
				ant.popup = 0;
				ant.can_attack = true;
				ant.unhurtflag = true;
				ant.start_walking = true;
				ant.change_animation(ant, "walk");
				ant.hp++ 
			}	
			
			
		}else if (ant.hp <= 0) {
			ant.die(ant);
		}else { // ant.hp >= 1

			if (ant.animation == "walk") {
				//var Antbody = ant.body;
				//Antbody.ApplyImpulse(new B2d.b2Vec2(-5,0), Antbody.GetWorldCenter());
				
				/*
				if(ant.path_free(ant))
				{ ant.direction = false;}
				else
				{ ant.direction = true;}
				*/
				ant.move(ant);
				//var velocity = Antbody.GetLinearVelocity();
				//velocity.x = -ant.speed;
				//Antbody.SetLinearVelocity(velocity); // body.SetLinearVelocity(new b2Vec2(5, 0)); would work too
				//Antbody.SetAwake(true);
				ant.start_walking = false;
				ant.popup = 0;
			}
			
			
			if (ant.can_attack && ant.me_hurt_hero && ant.animation == "walk"){
				// pass
			}
			if (ant.hero_hurt_me)
			{
				ant.take_damage(ant);
				ant.hero_hurt_me = false;
				ant.can_attack = false;
				ant.change_animation(ant, "upside_down");
				
			}
		}
	};


	/*
	var ant.change_animation = function(ant, progress_state) {
		ant.animation = progress_state;

	};
	*/
	// // //Set up Collision handler
	
	
	var begin_contact = function(contact, info){
		//handle collisions here
		
		//console.log(info.Me.id, ":", "My fixture", "'" + info.Me.fixture_name + "'", "came into contact with fixture", 
			//"'" + info.Them.fixture_name + "'", "of", info.Them.id);
		
		var type = info.Me.type;

		if(type !== "ant")
			console.log("Error", type, "instead of ant with other being", info.Them.type);
		
		
		if(info.Them.type == "hero")
		{
			
			if(info.Them.fixture_name != "bottom" && info.Me.entity.can_attack)
			{
				info.Me.entity.me_hurt_hero = true;
				
			}	
			else
			{
				info.Me.entity.hit_taken = true;//take damage if enemy collides from above and distance < vulnerability radius
				info.Me.entity.damage_taken = info.Them.entity.damage;
				info.Me.entity.hero_hurt_me = true;
			}
		}

	};

	var end_contact = function(contact, info) {
	
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

module.exports = AntLogic;

var Includes = require("../Includes.js"); var include_data = Includes.get_include_data({
	current_module: "AntLogic", 
	include_options: Includes.choices.LOGIC_SPECIFIC
}); eval(include_data.name_statements); var include = function(){eval(include_data.module_statements);}
