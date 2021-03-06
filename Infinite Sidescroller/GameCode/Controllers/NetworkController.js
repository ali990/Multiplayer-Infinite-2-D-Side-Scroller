
var NetworkController = (function(){
	/* manages p2p communication
	*/

	var peer, conn; // TEMPORARY. there will be multiple of those things
	var MEDIATOR_SERVER_KEY = 'lvgioxuj3ylm1jor'; //'l2f8f8vtbhcfecdi'; //'a7vojcpf70ysyvi';

	var init = function(){
		/* is ran from the InitController once when the game is loaded */
		include(); // satisfy requirements

		// TODO: make sure that sensitive host info (like spawn request that have not been
		// satisfied yet) are processed correctly before unloading
		// also it may make sense to handle even situations when the page was forced to unload
		// even before the function was called (power problem?)
		document.onbeforeunload = on_unload; // will be executed before user leaves page
		NetworkModel.hey = false;
	};


	var update = function(delta){
		/* is ran each tick from the GameController.update_all */

		var cmds = KeyboardController.debug_commands();

		if(!NetworkModel.block_connections && cmds("connect") && Config.Init.mode == "test"){ 
			NetworkModel.block_connections = true;
			var players = ["player1", "player2", "player3", "player4", "player5", "player6", "player7", "player8"];
			start_multiplayer_session(players);
			Config.Init.player_id_array = players;
		}

		if(cmds("show_connected")){
			console.log(get_all_connected());
		}

		if(Config.Remote.connected){
			if(Config.Remote.master){
				// if I am the master, distribute data
				send_out_data();
			}else{
				// if not the master, just send data to the master
				send_data_to_master();
			}
		}

	};

	var start_multiplayer_session = function(ids){
		/**
		* perform procedures to start playing with all
		* other connected people
		*/
		NetworkModel.peers_to_connect = ids;

		// to not interrupt connection process
		GameController.stop_game();

		if(Config.Init.mode != "test"){	
			// create peer, assign id
			var peer = NetworkModel.my_peer = new_peer(Config.Init.player_id); 
			peer.on('error', handle_standart_peer_error);
			peer.on('open', on_obtaining_id_successfully);
			NetworkModel.my_peer = peer;
			NetworkModel.my_id = Config.Init.player_id;

		}else{

			setup_network_variables_for_testing_mode();
			setup_my_peer_test(); // setup peer // also picks free idr// calls >on_obtaining_id_successfully
		}
				
	};

	var setup_network_variables_for_testing_mode = function(){
		/**
		* setup various parameters for the testing mode game
		*/
		var ids = NetworkModel.peers_to_connect;

		NetworkModel.connections = {};
		NetworkModel.free_ids = [];

		for(var i = 0; i < ids.length; i++){
			var id = ids[i];
			NetworkModel.connections[id] = null;
			NetworkModel.free_ids.push(id);
		}

		NetworkModel.non_free_ids = [];

	};
	
	
	var handle_standart_peer_error = function(error){
		/**
		* this function is for connection errors
		* in non-test mode
		*/

		//console.log(error);
		//throw "Peer error";
		
	};
	

	var on_obtaining_id_successfully = function(id){
		/**
		* when the player id for this client was successfully
		* found through the process in the setup_my_peer_test(); function,
		* this function is called, which should setup all necessary things for 
		* the multiplayer to work, and connect to the other player
		*/

		NetworkModel.my_id = id;
		if(Config.Init.player_id == null){
			Config.Init.player_id = id;
		}

		Config.Remote.connected = true;

		var peer = NetworkModel.my_peer;

		peer.on('error', on_peer_error);

		if(NetworkModel.my_id != NetworkModel.my_peer.id){
			// not a meaningful check, terrible practices are terrible
			throw "Id's do not match. Smth went wrong" 
		}

		console.log("Obtained id sucessfully, my id is", id);

		if(Config.Init.mode == "test"){
			console.log("Playing in testing multiplayer mode");
		}else{
			console.log("Playing in normal multiplayer mode");
		}

		/* note that if other peers connect in the future, 
		 * connection with them will be handled at that time
		 * through accept_connection function
		 */
		connect_to_others();

		// allow time for connections to be established, then pick the master
		NetworkModel.timeout_id = setTimeout(pick_the_master, Config.Remote.notification_wait);
	};


	var connect_to_others = function(){
		/**
		* connect to all other peers that are available at this time
		*/
		var ids = NetworkModel.peers_to_connect;
		for(var i = 0; i < ids.length; i++){

			var id = ids[i];

			if(id != NetworkModel.my_id){
				var connection = NetworkModel.my_peer.connect(id);

				setup_connection_listeners(connection);
			}
		}

	};

	
	var on_peer_error = function(error){
		/**
		* called on peer error;
		* notice that this function doesn't handle
		* peer errors that arise from inability to create peer because of id conflicts,
		* as this function is attached as listener only after the peer is sucessfully
		* created
		*/
		//console.warn("Peer error", error);
	};

	
	var setup_my_peer_test = function(error){
		/**
		* setups your personal peer picking free id, and returning it
		* looking up for the free id's is a huge pain now, once we run our
		* own peer matching server, it'll be a lot easier
		*
		* >error< parameter is null on the first call, but if first id that was
		* tried was already taken, and function is called again, it'll not be null 
		*/

		if(error == null || error.type == "unavailable-id"){
			if(NetworkModel.free_ids.length > 0){
				var id = NetworkModel.free_ids.pop();
				NetworkModel.non_free_ids.push(id);
				var peer = NetworkModel.my_peer = new_peer(id); 
				peer.on('error', setup_my_peer_test);
				peer.on('open', on_obtaining_id_successfully);
			}else{
				console.warn("Couldn't establish multiplayer session, all " + String(NetworkModel.peers_to_connect.length) + " available slots taken");
				Config.Remote.connected = false;
				NetworkModel.block_connections = false;

				setup_network_variables_for_testing_mode();
			}
		}else{
			//console.warn("Peer error", error);
		}
		
	};

	var on_connection_open = function(){
		/**
		* on opening the connection
		*/

		var id = this.peer;	
		
		console.log("Successfully initiated new connection with the peer", id);

		var connected_peers = NetworkModel.connected_peers;
		if(connected_peers.indexOf(id) < 0){
			// if this id isn't registered as connected yet,
			// add to list of the connected peers
			NetworkModel.connected_peers.push(id);
		}

		NetworkModel.connections[id] = this;
		
	};

	var on_connection_closed = function(){
		/**
		* called when some connection closes
		*/
		var id = this.peer;
		var nfree = NetworkModel.non_free_ids;
		var connected_peers = NetworkModel.connected_peers;

		// remove from not free ids [makes sense only in test mode]
		nfree.splice(nfree.indexOf(id), 1);
		// add back to free ids [makes sense only in test mode]
		NetworkModel.free_ids.push(id);

		// remove from the list of connected peers
		connected_peers.splice(connected_peers.indexOf(id), 1);
		

		delete NetworkModel.connections[id];


		if(NetworkModel.master_id === id){
			GameController.stop_game();
			console.log("Closing connection with the master");
			NetworkModel.master_id = null;
			pick_the_master();
		}

		MultiplayerSyncController.purge_all_data_for(id);

		console.log("Connection with peer", id, "was successfully closed");
	};

	var on_connection_error = function(error){
		/**
		* when error on trying to establish connection occurs;
		* most often it will be error for peer not existing. that's part of the normal process
		*/
		
		console.log("connection error (likely not a bug)");
	};
	
	var pick_the_master = function(){
		/**
		* pick the master (one with whome everyone synchronizes)
		* for the current group of peers.
		*/

		if(NetworkModel.master_id != null){
			// if master was chosen already
			console.log("master is already chosen");
		}else{

			var ids = NetworkModel.peers_to_connect;

			var conns = NetworkModel.connections;

			for(var i = 0; i < ids.length; i++){
				var id = ids[i];

				if(conns[id] != null && id != NetworkModel.my_id){
					set_master(id);
					console.log("The master is", id);
					break;
				}else if(id == NetworkModel.my_id){
					// i am the best candidate for master
					console.log("I am the law (was chosen as master)");
					set_master(id);
					break;
				}
			}
		}

		GameController.continue_game();

	}; // end pick_the_master
	
	var set_master = function(id){
		/**
		* set the master to the peer with given id
		* and perform all associated procedures
		*/

		NetworkModel.master_id = id;
		
		if(NetworkModel.master_id == NetworkModel.my_id){
			// if master

			// set the master flag
			Config.Remote.master = true;
			
			
		}// fi

		// send out initial sync data
		send_initialization_data();
	};

	var send_initialization_data = function(){
		/**
		* send the initialization data to the peer with the given id
		*
		*/

		var conns = NetworkModel.connections;
		for(var id in conns){
			if(id != NetworkModel.my_id && conns[id]){
				send_initialization_data_to(id);
			}
		}

	};


	var send_initialization_data_to = function(id){
		/**
		* description
		*/

		console.log("sending initialization data to", id);
		
		
		if(NetworkModel.master_id == NetworkModel.my_id){
			data = [];

			var arr = MultiplayerSyncController.get_initialization_data_master();

			for(var i = 0; i < arr.length; i++){
				data.push(arr[i]);
			}

			send_to(id, {op: "special_communication", special_communication: true, message: "I am the law!", master_id: NetworkModel.my_id});
			send_to(id, data);
		}

	};
	
	
	var new_peer = function(id){
		/**
		* pass the id you want the peer to have
		* returns created peer
		*/
		
		var peer = new Peer(id, {key: MEDIATOR_SERVER_KEY});

		peer.on('connection', accept_connection);


		return peer;
	};

	var accept_connection = function(conn){
		/**
		* takes connection
		* is called when someone attempts to establish connection
		* with this client
		*/

		var free_ids = NetworkModel.free_ids;
		var nfree_ids = NetworkModel.non_free_ids;

		var id = conn.peer;
		NetworkModel.connections[id] = conn;

		// remove the id from list of free ids. notice that 
		// array is relatively small, and operation happends seldomly
		free_ids.splice(free_ids.indexOf(id), 1); 

		console.log("accepting connection from peer", id);
		
		nfree_ids.push(id);

		setup_connection_listeners(conn);

		setTimeout(function(){
				send_initialization_data_to(id)
			}
			, Config.Remote.connection_timeout);

	};

	var setup_connection_listeners = function(connection){
		/**
		* description
		*/
		connection.on('data', on_data_arrival);
		connection.on('close', on_connection_closed);
		connection.on('open', on_connection_open);
		connection.on('error', on_connection_error);
	};
	
	

	var connection_unsuccessful = function(error){
		/**
		* for now, just add the peer to which was trying to connect to the
		* free peers list. Later some investigation or reconnection attempts
		* may be implemented
		*/

		console.log(error);
		
	};

	var send_to = function(peer_id, data){
		/**
		* send data to the peer with the peer_id
		* you can make decision to delay data sending, or change
		* procedure somehow right here
		* but do not try to compress the data in this function.
		* send_to will be fired multiple times per each piece of data
		* (it'll be sent to all other players) so any compression should
		* take place in the "distribute_data" function
		*/

		var conn = NetworkModel.connections[peer_id];

		if(conn != null){
			conn.send(data);
		}else{
			throw "No connection exists for the peer with id " + String(id);
		}
		
	};


	var distribute_data = function(data){
		/**
		* First, manipulate the data to properly compress it, or decide what should
		* and what shouldn't be sent (make sure to document stuff here, because people
		* will pull their hair out trying to understand why their stuff doesn't get sent)
		* Second, send the data to all the connected players in this game
		*/

		var conns = NetworkModel.connections;
		for(var id in conns){
			if(id != NetworkModel.my_id && conns[id]){
				conns[id].send(data);
			}
		}
		
	};


	var on_unload = function(arguments){
		/**
		* will be called when the user is about to leave the web page
		* will make sure connections are gracefully closed and peers are destroyed
		*/

		console.log("document is unloaded now. Destroying peer, disconnecting from others");
		NetworkModel.my_peer.destroy();	
	};
	
	
	var on_event = function(smth){
		/**
		* dummy function, delete when isn't called from anywhere
		*/
		
	};


	var on_data_arrival = function(data){
		/**
		* is called whenever new data arrives
		*/

		if(data.special_communication != null){
			// if this is network handling data,
			// not the regular multiplayer data transfer

			if(data.message == "I am the law!"){
				var m_id = data.master_id;

				set_master(m_id);
				console.log("The master is", m_id);
				//clearTimeout(NetworkModel.timeout_id); // will give an error if timeout passed?
			}

			// stop processing
			return;
		}

		if(NetworkModel.recieve_array == null){
			NetworkModel.recieve_array = data;
		}else{
			for(var i = 0; i < data.length; i++){
				NetworkModel.recieve_array.push(data[i]);
			}
		}
	};


	var on_error = function(error){
		/**
		* called when error occurs with the peer
		*/
	};


	var connect_to = function(id, peer){
		/**
		* connect peer >peer< to the peer with the given >id<
		* returns connection object
		*/
		
		var conn = peer.connect(id);

		return conn;
	};
	

	var retrieve_from_backlog = function(){
		/**
		* gets packet from the linked list
		* and removes it from the list
		*/
		
		var list = NetworkModel.package_backlog;

		if(list.HEAD == null){
			return null;
		}

		var packet = list.HEAD.packet;

		list.HEAD = list.HEAD.next;
		list.HEAD.previous = null;

		return packet;

	};


	var place_to_backlog = function(packet){
		/**
		* puts packet into the linked list
		*/
		var list = NetworkModel.package_backlog;
		var packet_container = {packet: packet}; 
		if(list.HEAD == null){
			list.HEAD = packet_container;
			list.TAIL = packet_container;
		}else{
			packet_container.previous = list.TAIL;
			list.TAIL.next = packet_container;
			list.TAIL = packet_container;
		}
	};
	

	var add_to_next_update = function(data){
		/**
		* call this function to schedule the data to be passed to the master/clients.
		* note that this module will decide itself when and how to send the data,
		* so you are not guaranteed that it'll be send immediately, or with the next update
		* You should account for that. This function is meant to be intelligent and prioritize more important
		* stuff
		*/

		NetworkModel.send_array = NetworkModel.send_array || [];

		NetworkModel.send_array.push(data);
	};

	var send_out_data = function(){
		/**
		* temp
		*/
		
		if(NetworkModel.send_array != null){
			
			distribute_data(NetworkModel.send_array);
			NetworkModel.send_array = null;
		}

	};

	var send_data_to_master = function(){
		/**
		* send the prepared data to the master
		*/
		var master_conn = NetworkModel.connections[NetworkModel.master_id];
		if(NetworkModel.send_array != null && master_conn != null){
			master_conn.send(NetworkModel.send_array);
			NetworkModel.send_array = null;
		}

	};
	

	var get_data = function(){
		/**
		* get the data array
		*/
		
		var data = NetworkModel.recieve_array;
		
		return data;
	};

	var clean_data = function(){
		/**
		* description
		*/
		delete NetworkModel.recieve_array;
	};
	
	var get_network_id = function(){
		// returns my network id if I am connected,
		// or "local" if not
		if(Config.Remote.connected){
			return NetworkModel.my_id;
		}else{
			return "local";
		}
	};

	
	var get_all_connected = function(){
		/**
		* gets array of ids for all connected peers
		* your own id isn't included, naturally
		*/
		
		return NetworkModel.connected_peers;
		
	};
	
	return {
		// declare public
		init: init, 
		update: update,
		add_to_next_update: add_to_next_update,
		get_data: get_data,
		clean_data: clean_data,
		get_network_id: get_network_id,
		send_to: send_to,
		start_multiplayer_session: start_multiplayer_session,
		get_all_connected: get_all_connected,
	};
})();

module.exports = NetworkController;

var Includes = require("../Includes.js"); var include_data = Includes.get_include_data({
	current_module: "NetworkController", 
	include_options: Includes.choices.DEFAULT
}); eval(include_data.name_statements); var include = function(){eval(include_data.module_statements);}
