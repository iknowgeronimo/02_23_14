var BackgroundView = Backbone.View.extend({
    
    originalW:356,
    originalH:634,

    initialize : function() {
        var self = this;
        $(window).on("resize", {self:self},this.resize);

    },

    render : function() {
        var html = $("#background-tpl").text();
        this.$el.html(html);
        this.$el.appendTo('#bg');

        originalW = $('.background-image').width();
        originalH = $('.background-image').height();
        this.resize();
    },

    changeBackground :function(bg_url)
    {
        $('.background-image').attr('src',bg_url);
    },

    finalize : function(){
        this.$el.remove();
    },
    
    resize : function(event) {
        var self = this;

        var stageW = $(window).width();
        var stageH = $(window).height();

        if(event && event.data && event.data.self)
            self = event.data.self

        if(self.originalW != 0 && self.originalH != 0)
        {
            var ratio = Math.max(stageW/self.originalW , stageH/self.originalH);
            var nw = self.originalW*ratio;
            var nh = self.originalH*ratio;
            var px = (stageW - nw)/2;
            var py = (stageH - nh)/2;
            $('.background-image').css(
            {
                'width':nw+'px',
                'height':nh+'px',
                'top':px+'px',
                'left':py+'py'
            })

            $('.general-bg').css(
            {
                'width':stageW+'px',
                'height':stageH+'px'
            })
        }

    }

});