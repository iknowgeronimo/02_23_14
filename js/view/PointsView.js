var PointsView = Backbone.View.extend({
    cruise:null,
	events: {
        'click .bt-back': 'onBack'
    },

    initialize : function() {
        var self = this;
        
    },

    render : function() {

        console.log("render");

        var html = $("#points-tpl").text();
        this.$el.html(html);
        this.$el.appendTo('#content');
        

        var centerOfMap = new google.maps.LatLng(47.497907,19.040223);
  
        var mapOptions = {
            zoom: 10,
            center: centerOfMap,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI:   true,
            panControl:         true,
            panControlOptions:{
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.TOP_RIGHT
            },
              
        };

        var map = new google.maps.Map($("#points-map")[0], mapOptions);
          
        var ctaLayer = new google.maps.KmlLayer('http://mapsengine.google.com/map/kml?mid=zExnnxeRb8Rc.kA__JyxCbZVo&amp;lid=zExnnxeRb8Rc.kthqHp1YF3uE');
        ctaLayer.setMap(map);
        
        /*
        for (var i = data.length - 1; i >= 0; i--) {
            var html = $("#point-detail-tpl")[0];
            
            html.appendTo('.points-bullet');
            data[i]
        };
        */
        this.resize();

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