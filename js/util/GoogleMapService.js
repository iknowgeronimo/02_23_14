var GoogleMapService = Backbone.Model.extend({


	distanceService: null,

    init: function() {
        console.log("GoogleMapService init")
        var self = this;
		/*google.maps.event.addDomListener(window, 'load', function(){
			self.mapsLoaded(self);
		});*/

    },

    mapsLoaded:function(){
    	this.distanceService = new google.maps.DistanceMatrixService();

    	
    	if(app.init_map_service == false)
    	{
            console.log("GoogleMapService success");
    		app.init_map_service = true;
    		app.initComplete();
    	}
    },

    getDistanceBetweenLocation:function (caller, callback,param, lat1, long1, lat2, long2) {
    	var self = this;
    	var origin = new google.maps.LatLng(lat1, long1);
		var destination = new google.maps.LatLng(lat2, long2);

		self.distanceService.getDistanceMatrix(
		{
		    origins: [origin],
		    destinations: [destination],
		    travelMode: google.maps.TravelMode.WALKING
		}, function(response){
            callback(caller,response, param)
        });


    },

    

});