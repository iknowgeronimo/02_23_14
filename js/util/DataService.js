var DataService = Backbone.Model.extend({
	cruise:null,
	connectionStatus:null,
	CITIES_ID: {
        "london": "2643743",
        "budapest": "3054643",
        "vienna": "2761369",
        "bratislava": "3060972"
    },
    COUNTRY_CODE: {
        "HU": "Hungary",
        "NL": "Netherlands"
    },

	init:function(app)
	{
		var self = this;
		$.ajax({
            dataType: "json",
            url: "data/cruise.json",
            success: function(h_data) {
                console.log("DataService success");
                $('#debug').append("DataService</br>");
                self.cruise = h_data;
                if(app.init_data == false)
		    	{
		    		app.init_data = true;
		    		app.initComplete();
		    	}
                
            },
            error: function(error){
                console.log("ERROR LOADING Data: "+error.statusText)
            }

        });

		
	},

	setDatas:function()
	{
		this.weekday=new Array("Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
        this.months=new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec");
	},

	formatTime:function(time)
	{
		if(time > 2880)
		{
			return Math.floor(time/24/60) + " days " + Math.floor(time/60%24) + ' hours ' + time%60 + 'minutes';
		}else if(time > 1440)
		{
			return Math.floor(time/24/60) + " day " + Math.floor(time/60%24) + ' hours ' + time%60 + 'minutes';
		}else if(time > 120)
		{
			return Math.floor(time/60%24) + ' hours ' + time%60 + ' minutes';
		}else if(time > 60)
		{
			return Math.floor(time/60%24) + ' hour ' + time%60 + ' minutes';
		}else
		{
			return time%60 + ' minutes';
		}
   		
 
	},

	updateConnectionStatus:function()
	{
		this.connectionStatus = navigator.onLine ? 'online' : 'offline';
	},

	getWalkingTourbyID:function(id)
	{
		var walking_tour = null;
		for (var i = this.cruise.walking_tours.length - 1; i >= 0; i--) {
			if(this.cruise.walking_tours[i].id == id)
			{
				walking_tour = this.cruise.walking_tours[i];
			}
		};
		return walking_tour
	},

	getWalkingTourListbyID:function(id)
	{
		var walking_tour_list = [];
		for (var i = this.cruise.walking_tours.length - 1; i >= 0; i--) {
			if(this.cruise.walking_tours[i].id == id)
			{
				walking_tour_list = this.cruise.walking_tours[i].walking_tours_list;
			}
		};
		return walking_tour_list
	},

	getWalkingTourContentbyID:function(content_id)
	{
		var walking_tour = null;
		
		for (var i = this.cruise.walking_tours.length - 1; i >= 0; i--) {
			var walking_tour_list = this.cruise.walking_tours[i].walking_tours_list;
			
			for (var n = walking_tour_list.length - 1; n >= 0; n--) {
				if(walking_tour_list[n].id == content_id)
				{
					walking_tour = walking_tour_list[n];
				}
			};
		};
		
		
		return walking_tour;
	},

	getGountryByCode:function(code)
	{
		var country = "";

		$.each( this.COUNTRY_CODE, function( key, value ) {
          if(code==key){
            country = value;
            return country;
          }
        });

        return country;
	},

	 

	isConnected:function(){
		var connected = true;
		if(this.connectionStatus == 'offline')
		{
			connected = false;
		}
		return connected;
		//return false;

	}

});