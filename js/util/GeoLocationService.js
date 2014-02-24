var GeoLocationService = Backbone.Model.extend({

	enable_location_simulation:false,
	simulation_array:[],
	simulation_current_index:null,
	simulation_going_back:false,
	simulationInterval: null,

	watchId:null,
	bearingWatchId:null,
	user_latitude:null,
	user_longitude:null,
	raw_user_latitude:null,
	raw_user_longitude:null,
	user_accuracy:null,
	user_speed:null,
	device_bearing:0,
	timestamp:null,

	init:function()
	{
		this.updateLocation(this);
		this.updateBearing();
	},

	enableUserSimulation:function(route)
	{
		var self = this;

		this.simulation_array = route;
		this.simulation_going_back = false;
		this.simulation_current_index = 0;
		this.resumeSimulation();
	},

	updateSimulation:function()
	{
		
		this.user_latitude = this.simulation_array[this.simulation_current_index].lat();
		this.user_longitude = this.simulation_array[this.simulation_current_index].lng();

		// console.log("updateSimulation", this.simulation_array);

		if(this.simulation_current_index < this.simulation_array.length -1)
		{
			this.simulation_current_index++;
		}else{
			this.stopSimulation();
		}
	},

	pauseSimulation:function(){
		clearInterval(this.simulationInterval);
	},

	resumeSimulation:function(){
		var self = this;
		this.simulationInterval = setInterval(function () {
            self.updateSimulation();
        }, 2000);
	},


	stopSimulation:function(){

		// this.enableUserSimulation = false;
		clearInterval(this.simulationInterval)
	},

	updateLocation:function(self)
	{

		var options = {timeout: 10000, enableHighAccuracy:false};
		this.watchID = navigator.geolocation.watchPosition(function(position){
			self.geoSuccess(self , position)
		}, function(error){
			self.geoError(error, self)
		}, options);


	},

	updateBearing:function()
	{
		var self = this;
		var options = { frequency: 1000 };  // Update every 3 seconds
		if(navigator.compass)
		{
			this.bearingWatchId = navigator.compass.watchHeading(function(heading){
				console.log('Geolocation Call Bearing Response: '+heading.magneticHeading)
				self.onBearingSuccess(self, heading.magneticHeading)
			}, self.onBearingError, options);
		}
		

	},

	onBearingSuccess:function (self, heading) {
    	self.device_bearing = heading
    	console.log('Geolocation Bearing: '+self.device_bearing)
    	//$('#debug').append("Geolocation Bearing</br>"+self.device_bearing);
	},

	onBearingError: function() {
	    console.log('onBearingError!');
	},

	
	// GEOLOCATION EVENTS
    geoSuccess : function(self, position) {
    	console.log("GeoLocationService success");
    	$('#debug').append("GeoLocationService</br>");
    	
        var timestamp = new Date(position.timestamp)

        this.raw_user_latitude = position.coords.latitude;
        this.raw_user_longitude = position.coords.longitude;
        if(this.enable_location_simulation == false)
        {
        	this.user_latitude = position.coords.latitude ;
        	this.user_longitude = position.coords.longitude; 
        }
        
       	this.user_accuracy = position.coords.accuracy;
        this.user_speed = position.coords.speed;
        this.timestamp = timestamp.toUTCString();

        if(app.init_geo_service == false)
    	{
    		app.init_geo_service = true;
    		app.initComplete();
    	}
       
    },

    geoError : function(error, self) {
        var geoError = 'code: '+ error.code+ '\n' +'message: ' + error.message + '\n';
        console.log(geoError);
        $('#debug').append("GeoLocationService error</br>");
        $('#debug').append("code: ", error.code+"</br>");
        $('#debug').append("message: ", error.message+"</br>");

        
        if(app.init_geo_service == false)
    	{
	        navigator.notification.alert(
			    'Some data related to position might be inaccurate. Please enable location access in phone setting.',  // message
			    function(){
			    	$('#debug').append("alert continue");
			    	self.locationAlertDismissed(self);

			    },         // callback
			    'Unable to retrieve location',            // title
			    'Close'                  // buttonName
			);
	    }else{
	    	 self.updateLocation(self);
	    }

	   
    },

    locationAlertDismissed : function(self){
    	$('#debug').append("alert continue retry");

		if(app.init_geo_service == false)
    	{
    		app.init_geo_service = true;
    		app.initComplete();
    	}

	 	self.updateLocation(self);

    },

    

    getDistanceBearing : function(lat1, lon1, lat2, lon2){
    	var R = 6371; // km
		var dLat = this.toRad(lat2-lat1);
		var dLon = this.toRad(lon2-lon1);
		var lat1 = this.toRad(lat1);
		var lat2 = this.toRad(lat2);

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var distance = R * c;

		var y = Math.sin(dLon) * Math.cos(lat2);
		var x = Math.cos(lat1)*Math.sin(lat2) -
		        Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
		var bearing = this.toDeg(Math.atan2(y, x));

		return {distance:distance, bearing:bearing}
    },

    toRad : function(Value) {
    	/** Converts numeric degrees to radians */
    	return Value * Math.PI / 180;
	},

	toDeg : function(Value) {
    	/** Converts numeric degrees to radians */
    	return Value * (180/Math.PI) ;
	}

	 

});