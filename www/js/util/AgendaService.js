var AgendaService = Backbone.Model.extend({
	datas:null,
	
	init:function(app)
	{
		var self = this;
		$.ajax({
            dataType: "json",
            url: "data/agenda.json",
            success: function(h_data) {
                // console.log("agenda data received");
                $('#debug').append("AgendaService</br>");
                self.datas = h_data;
                if(app.init_agenda == false)
		    	{
		    		app.init_agenda = true;
		    		app.initComplete();
		    	}
                
            },
            error: function(error){
                console.log("ERROR LOADING Data: "+error.statusText)
            }

        });
	},

	getEvents:function()
	{
		var events_list = [];
		var events_length = this.datas.agenda[0].dailyagenda.events.length;
		for (var i = 0; i <events_length; i++) {
			events_list.push(this.datas.agenda[0].dailyagenda.events[i]);
		};
		return events_list
	},

	getDays:function()
	{
		var day_list = [];
		var days_length = this.datas.agenda.length;
		for (var i = 0; i <days_length; i++) {
			day_list.push(this.datas.agenda[i]);
		};
		return day_list
	}

});