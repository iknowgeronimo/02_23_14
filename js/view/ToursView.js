var ToursView = Backbone.View.extend({

    data:null,
	events: {
        'click .bt-back': 'onBack'
    },

    initialize : function() {

    },

    render : function() {

        var self = this;
        console.log("render");

        var html = $("#walking-tour-index-tpl").text();
        this.$el.html(html);
        this.$el.appendTo('#content');
        this.resize();

        this.data = app.dataService.getWalkingTourListbyID(app.walking_tour_id);

        for (var i = this.data.length - 1; i >= 0; i--) {
            var wt_html = $("#walking-tour-index-item").html();
            wt_html = $(wt_html);
            wt_html.children('.walking-tour-index-title').html(this.data[i].title);
             wt_html.children('.walking-tour-index-description').html(this.data[i].description);
            wt_html.find('.text-time-distance').html(this.data[i].duration);
            wt_html.find('.text-checkpoint').html(this.data[i].checkpoints.length+' checkpoints');
            wt_html.children('.walking-tour-index-cover').html('<img src="'+this.data[i].cover+'"/>');
            
            wt_html.appendTo('.walking-tour-items');
            
            var tid = self.data[i].id
            
            wt_html.bind('click', function(event) {
                self.onTourClick(tid);
            });


        };

    },

    onTourClick:function(id)
    {
        app.router.navigate('#/tours/'+id, {trigger: true});
    },

    onBack : function() {
        console.log("onBack");
        app.router.navigate('', {trigger: true});
    },

    finalize : function(){

    },
    
    resize : function() {

    }

});