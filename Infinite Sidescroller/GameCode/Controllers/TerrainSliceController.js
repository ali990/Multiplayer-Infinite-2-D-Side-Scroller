
var TerrainSliceController = (function () {

	var init = function(){
		/* is ran from the InitController once when the game is loaded */
		include(); // satisfy requirements
		IdentificationController.assign_type(TerrainSliceModel.Cell, "terrain_cell");

	};

	var update = function(slice){
		

	};

	var get_next_origin = function(){
	};
	

	var spawnBlock = function(x, y, seed){
		//spawn instance of this entity at the given coordinates
		var block = new TerrainSliceModel.Cell(getRandomNumber(seed)%3+1);
		IdentificationController.assign_id(block);
		block.body = PhysicsController.get_rectangular({x: x, y: y}, block);
		return block;
	};
	
	var spawnGap = function(x,y){
		// 0 will be the id for the "air" i.e. nothing
		var gap;
		gap = new TerrainSliceModel.Cell(0);
		IdentificationController.assign_id(gap);
		return gap;
	};
	
	var getRandomNumber = function(seed){
		return Math.floor(Math.random()*1000);
	};
	
	var buildTerrainSlice = function(slice){
	
		var seed = Math.floor(Math.random()*1000);//placeholder for seed
		
		//set variables
		var rows = slice.grid_rows;
		var columns = slice.grid_columns;
		var i,j;
		var ground_lvl = rows - (getRandomNumber(seed)%3+2); //the row that is considered ground level.
		var hgap_min = 8;				//minimum size of gaps between platforms
		var hgap_length = 0; 		//current number of consecutive horizontal gaps
		var pit_max = 3;				//maximum length of pits in blocks
		var pit_length = 0; 		//current number of consecutive pits
		var has_pit = [];
		var pit_frequency = 10; 		//base percentage chance of a pit being dug
		var platform_length_max = 5;	//maximum length of a platform in blocks
		var platform_length = 0; 		//length of currently generated platform
		var platform_count_max = 2; //maximum number of platforms per column
		var platform_count = []; 		//keeps track of platforms per column
		var platform_frequency = 10;//base percentage chance of a platform to be generated
		/*
		var spike frequency
		var column frequency
		etc.
		*/
		for(i=0; i<=columns;i++){
			platform_count[i] = 0;
			has_pit[i] = false;
		}
			
		
		
		//build the stage from the bottom up
		/*
		Build Stage from bottom up, left to right
		load blocks and gaps into slice.grid[i][j]
		
		*/
		for(i=rows - 1;i>=0;i--){ //outer loop: generate rows bottom to top
			slice.grid[i] = [];
			seed+=17;//stupid thing to test without real random numbers
			for(j=0;j<columns;j++){ //inner loop: generate from left to right within current row
				seed+=1;//stupid thing to test without real random numbers
				var x = slice.origin.x + j * slice.cell_w + slice.cell_w/2;
				var y = slice.origin.y + i * slice.cell_w + slice.cell_w/2;
				
				if (i >= ground_lvl){	//If on or below ground level, Generate Ground
					if (pit_length < pit_max && (getRandomNumber(seed)%100 < pit_frequency || pit_length == 1 || has_pit[j])){
						slice.grid[i][j] = spawnGap(x,y); //create gap
						has_pit[j] = true;
						pit_length++; //the pit gets wider
					}
					else{
						slice.grid[i][j] = spawnBlock(x,y,seed);//create a ground block
						pit_length = 0; //any pits being spawned have been interrupted
						if (i == ground_lvl)
							slice.grid[i][j].position = "surface";
						else{
						slice.grid[i][j].position = "underground";
						}
					}
				}
				else{ //ElSE Generate Platforms
					if((hgap_length >= hgap_min || platform_length > 0) //if there is a large gap or a platform being built
					&& (platform_length < platform_length_max) // and any platform being built is less than max length
					&& (platform_count[j] < platform_count_max) // and the current column's platform limit has not been met
					&& (platform_length > 0 || (j<columns-1 && platform_count[j+1] < platform_count_max))){ //and the platform is not going to be a singleton
						if (getRandomNumber(seed)%100 < platform_frequency || (platform_length > 0 && platform_length < 4)){
						
							slice.grid[i][j] = spawnBlock(x,y,seed);//create platform
							
							//check aesthetic stuff, like platform edges
							//put stuff like slice.grid[i][j].is_spiky here too
							if (platform_length == 0){
								slice.grid[i][j].position = "left";
							}
							else{
								slice.grid[i][j].position = "right";
							}
							if (j>0){if (slice.grid[i][j-1].kind != 0){
								if (slice.grid[i][j-1].position != "left"){
									slice.grid[i][j-1].position = "middle";
								}
							}}
							
							platform_length++;	//platform gets longer, and 
							platform_count[j]++;//the number of platforms in the current column increases
												
							hgap_length = 0; 		//reset the gap counter to 0
						}
						else{
							slice.grid[i][j] = spawnGap(x,y); //create a gap
							platform_length = 0; //if there was a platform, it has been interrupted
							hgap_length++; //the gap gets wider
						}
					}
					else{
						slice.grid[i][j] = spawnGap(x,y); //create a gap
						platform_length = 0; //if there was a platform, it has been interrupted
						hgap_length++; //the gap gets wider
					}
				}
			}
		}
		return slice;
	};
	
	var generate = function(x_offset){
	
		var slice = new TerrainSliceModel.Slice();

		slice.origin.x = x_offset;
		slice.origin.y = 0; //slice.id *slice.grid_rows * slice.cell_w - slice.cell_w*4;
		
		//var random_index = getRandom(seed)%100;
		//if (random_index < 60){
		slice = buildTerrainSlice(slice);
		//}
		//if (random_index < 30){}
		//if (random_index < 10){}

		return slice;
	};
	




	return {
		// declare public
		init: init, 
		update: update,
		generate: generate,
	};
})();

module.exports = TerrainSliceController;

var Includes = require("../Includes.js"); var include_data = Includes.get_include_data({
	current_module: "TerrainSliceController", 
	include_options: Includes.choices.DEFAULT
}); eval(include_data.name_statements); var include = function(){eval(include_data.module_statements);}

