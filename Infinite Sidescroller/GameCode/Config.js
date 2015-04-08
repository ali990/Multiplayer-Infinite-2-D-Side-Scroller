var Config = function(){
	this.SCREEN_W = 0; // set up when the page is loaded (to 95% of width of containing element) 
	this.SCREEN_H = 600;

	this.MAIN_CANVAS_NAME = "display_canvas";
	this.DEBUG_CANVAS_NAME = "debug_canvas";

	// Frames Per Second. Essentially, frequency of createjs.Ticker 
	// Warning! Frequency of the Box2D physics updates may be different
	// (Currently not implemented)
	this.FPS = 30; 

	// Box2D stuff >>>
	this.B2D = {
		SCALE: 30,
		SPS: 60, 			// Steps Per Second
		VELOCITY_ITR: 8,	// velocity iterations
		POSITION_ITR: 3,	// position iterations
		debug_draw: false
	};

	this.TerrainSlice = {
		grid_rows: 20,
		grid_columns: 20,
		cell_w: 1, // in meters

		// is automatically incremented each time new TerrainSliceModel is instantiated:
		next_slice_id: 0 
	};

	this.Remote = {
		master: false, // I am one with whome other players sync? 
	};
	
	// <<<
};

module.exports = new Config;
