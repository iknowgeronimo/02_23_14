var WikipediaService = Backbone.Model.extend({

	data:[],
	total_wiki_content:0,
	loaded_wiki_content:0,
	loading_initial_data:false,

    init: function() {
        console.log("Wikipedia init")

    },

    loadContent:function(context, callback, title){
    	$.getJSON("http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?", {page:title, prop:"text"}, function(data) {callback(context, data);});

    },



    loadInitialData:function(tour_id){
    	if(this.loading_initial_data == false)
    	{
    		this.loading_initial_data = true;

    		var walking_tour = app.dataService.getWalkingTourListbyID(app.walking_tour_id);
	    	this.loaded_wiki_content = 0;
	    	for (var i = 0; i < walking_tour.length; i++) {
                
	    		var wt = walking_tour[i];

                for (var k = 0; k < wt.checkpoints.length; k++) {
                    
					if(wt.checkpoints[k].wikipedia)
					{
						this.total_wiki_content++;
						this.loadContent(this, this.initialWikiLoaded ,wt.checkpoints[k].wikipedia )
					}
				};
	    		
	    	};
    	}
    	
    },

    getContent:function(title){
    	var content = null;
    	for (var i = this.data.length - 1; i >= 0; i--) {
    		if(this.data[i].title == title)
    		{
    			content = this.data[i];
    		}
    	};
    	return content;

    },

    initialWikiLoaded:function(self, content){
    	
    	self.data.push({
    		title:content.parse.title,
    		text:content.parse.text
    	})

    	self.loaded_wiki_content++;
    	if(self.loaded_wiki_content == self.total_wiki_content)
    	{
    		app.init_wikipedia = true;
            $('#debug').append("WikipediaService</br>");
    		app.initComplete();
    	}
    }

});