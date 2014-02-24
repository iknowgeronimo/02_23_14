var PreloaderView = Backbone.View.extend({
    
    initialize : function() {
        var self = this;
        
    },

    render : function() {
        var html = $("#preloader-tpl").text();
        this.$el.html(html);
        this.$el.appendTo('#content');

    },

    finalize : function(){
        this.$el.remove();
    },
    
    resize : function() {

    }

});