var AssetModel = new function(){
	// As always, almost anything is initialized in the InitController
	
	this.loader;
//mackerel
	this.manifest = [ // defining resources to be loaded in bulk with preload.js
			{src: "greek_warrior.png", id: "greek_warrior"},
			//{src:, id:},
			{src: "middle_terrain.png", id:"middle_terrain"},
			{src: "bottom_terrain.png", id: "bottom_terrain"},
			{src: "grass_summer.png", id: "grass_summer" },
			{src: "grass_winter.png", id: "grass_winter" },
			{src: "grass_fall.png", id: "grass_fall" },
			{src: "grass_spring.png", id: "grass_spring" },
			{src: "AntChompers.png", id: "Ant1"},
			{src: "AntChompers2.png", id: "Ant2"},
			{src: "AntChompersDeath.png", id: "Ant3"},
			{src: "Greek Landscape fall.png", id: "Fall"},
			{src: "Greek Landscape spring.png", id: "Spring"},
			{src: "Greek Landscape winter.png", id: "Winter"},
			{src: "Greek Landscape summer.png", id: "Summer"},
			{src: "griffinPhase1Small.png", id: "Griffin1" },
			{src: "griffinPhase2Small.png", id: "Griffin2" },
			{src: "griffinPhase3Small.png", id: "Griffin3" },
			{ src: "griffinDeathSmall.png", id: "GriffinDeath" },
            { src: "griffinDeathSmall2.png", id: "GriffinDeath2" },
            { src: "griffinDeathSmall3.png", id: "GriffinDeath3" },
			{ src: "MedusaSheet.png", id: "Medusa1" },
            { src: "CentaurSheet.png", id: "Centaur1" },
			{src: "platform_left.png", id: "left_platform" },
			{src: "platform_middle.png", id: "middle_platform" },
			{src: "platform_right.png", id: "right_platform" },
			{src: "HyenaPhase3.png", id: "HyenaSprite" },
			{src: "platform_spikes.png", id: "platform_spikes" },
			{src: "Hero.png", id: "Hero"},
			{src: "HeroHitRed.png", id: "HeroR"},
			{src: "HeroHitWhite.png", id: "HeroW"},
			{src: "HeroRed.png", id: "HeroRed"},
			{src: "HeroPink.png", id: "HeroPink"},
			{src: "HeroBlue.png", id: "HeroBlue"},
			{src: "HeroLPurple.png", id: "HeroLPurple"},
			{src: "HeroOrange.png", id: "HeroOrange"},
			{src: "HeroLB.png", id: "HeroLightBlue"},
			{src: "HeroLG.png", id: "HeroLightGreen"},
			{src: "HeroGreen.png", id: "HeroGreen"},
            {src: "pizza.png", id: "pizza"},
			{src: "HeadGreen.png", id: "HeadGreen"},
			{src: "HeadBlue.png", id: "HeadBlue"},
			{src: "HeadLightBlue.png", id: "HeadLightBlue"},
			{src: "HeadOrange.png", id: "HeadOrange"},
			{src: "HeadLightGreen.png", id: "HeadLightGreen"},
			{src: "HeadPurple.png", id: "HeadPurple"},
			{src: "HeadPink.png", id: "HeadPink"},
			{src: "HeadRed.png", id: "HeadRed"},

			
		]; 
		// TODO make adding resources easier? Automatic loading 
		// of everything from assets, automatic names etc.?

	this.shapes = {}; // maybe this aren't needed

	this.bitmaps = {};

	this.animations = {};

};

module.exports = AssetModel;
