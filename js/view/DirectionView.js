var DirectionView = Backbone.View.extend({
    cruise:null,
    
    user_lat:null,
    user_long:null,

    map:null,
    mapOptions:null,
    userMarker:null,
    userCurrentLocation:null,
    shipMarker:null,
    
    directionsDisplay:null,
    start_address:null,
    heading:null,
    duration:null,
    distance:0,
    steps:[],
    distanceInterval:null,
    directionInterval:null,

    requesting_direction:false,
    firstload_bl:false,

    events: {
        'click .bt-back': 'onBack'
    },

    initialize : function(id) {
        var self = this;
        
    },

    render : function() {

        var self = this;
        $(window).on("resize", {self:self},this.resize);

        this.firstload_bl = true;

        var html = $("#direction-container").text();
        this.$el.html(html);
        this.$el.appendTo('#content');

        $(".direction-content").append("<div class='loading'></div>");
        
        $('#direction-button-compass').bind('click', function(event) {
            self.onCompass(self);
        });
        $('#direction-button-map').bind('click', function(event) {
            self.onMap(self);
        });
        $('#direction-button-taxi').bind('click', function(event) {
            
        });

        this.distanceInterval = setInterval(function () {
            self.updateCompas();
            self.updateUserMarker();
        }, 1000);

        this.directionInterval = setInterval(function () {
            self.updateDirection(self);
        }, 500);

        this.resize();
        self.onCompass(this);
        $('.direction-content-compass').hide();

    },


    updateCompas:function(){
        if(this.user_lat ==  app.geoLocationService.raw_user_latitude && this.user_long == app.geoLocationService.raw_user_longitude)
            return;

        this.user_lat = app.geoLocationService.raw_user_latitude;
        this.user_long = app.geoLocationService.raw_user_longitude;
        
        
        var walking_tour = app.dataService.getWalkingTourbyID(app.walking_tour_id);
        var ship_lat = walking_tour.ship_latitue;
        var ship_long = walking_tour.ship_longitude;
        
        var distbearing = app.geoLocationService.getDistanceBearing(this.user_lat, this.user_long, ship_lat, ship_long);
        this.heading = distbearing.bearing;
        
        var self = this;

        if(app.dataService.isConnected() == true && self.requesting_direction == false)
        {
            self.updateRoute(self);   
        }else
        {
            this.distance = Math.floor(distbearing.distance)+' km';
            this.duration = app.dataService.formatTime(Math.floor(distbearing.distance/(5/60)));//human average speed is 5 km/ hours
            this.updateInformation(this)
        }
        
    },

    updateRoute:function(self)
    {
        var walking_tour = app.dataService.getWalkingTourbyID(app.walking_tour_id);
        var ship_lat = walking_tour.ship_latitue;
        var ship_long = walking_tour.ship_longitude;

        self.requesting_direction = true;
        var user_position = new google.maps.LatLng(this.user_lat, this.user_long);
        var ship_position = new google.maps.LatLng(ship_lat, ship_long);  

        var rendererOptions = {
            suppressMarkers:true,
            polylineOptions:{
                strokeColor: '#FF0000',
                strokeOpacity: 0.5,
                strokeWeight: 7
             }
        }

        var directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);    
        

        var request = {
            origin: user_position,
            destination:ship_position,
            travelMode: google.maps.DirectionsTravelMode.WALKING,
        };


        //this.heading = google.maps.geometry.spherical.computeHeading(user_position,ship_position);
        

        directionsService.route(request,function(result, status) {                
            if(status == google.maps.DirectionsStatus.OK){              
                self.directionsDisplay.setDirections(result);      
                self.directionsDisplay.setMap(self.map);
                var info = result.routes[0].legs[0];
                self.distance = info.distance.text;
                self.steps = info.steps; //step[n].instructions
                self.duration = info.duration.text;
                self.start_address = info.start_address;
                self.updateInformation(self)
                self.requesting_direction == false;
            }
            else
                console.log("[ERROR] - DirectionsService() : " + status);
                self.requesting_direction == false;
        });
    },

    updateInformation:function(self)
    {
        //console.log('DirectionView: update information')

        $('.direction-content .loading').hide();
        if(this.firstload_bl){
            $('.direction-content-compass').show();
            this.firstload_bl = false;
        }
        
        
        var distance_text = '';
        var dist_array = self.distance.split(" ");
        distance_text = dist_array[0];
        distance_text += '<span style="font-size:18px;font-family:Roboto-Regular;letter-spacing:0px;">'+dist_array[1]+'</span>'
        $('.direction-compass-distance').html(distance_text)
        $('.direction-compass-time').html(self.duration)
        if(self.start_address){
            $('.direction-map-legend-title').html(self.start_address );
        }

        if(self.steps && self.steps.length > 0)
        {
            $('.direction-map-steps-container').empty();
            for (var i = 0; i < self.steps.length; i++) {
                var templ = $("#direction-step-item").text();
                templ = $(templ);
                var instructions = self.steps[i].instructions;
                var templ_text = templ.find('.direction-step-text');
                templ_text.html(self.steps[i].instructions);
                var templ_distance =  templ.find('.direction-step-distance')
                templ_distance.html(self.steps[i].distance.text);
                var angle = -1;

                instructions = instructions.toLowerCase();
                if(instructions.indexOf('northeast') > -1)
                    angle = 45
                else if(instructions.indexOf('northwest') > -1)
                    angle = 315
                else if(instructions.indexOf('southwest') > -1)
                    angle = 225
                else if(instructions.indexOf('southeast') > -1)
                    angle = 135
                else if(instructions.indexOf('continue') > -1 || instructions.indexOf('north') > -1)
                    angle = 0
                else if(instructions.indexOf('left') > -1 || instructions.indexOf('west') > -1)
                    angle = 270
                else if(instructions.indexOf('right') > -1 || instructions.indexOf('east') > -1)
                    angle = 90
                

                console.log(instructions+':'+angle);
                var templ_arrow =  templ.find('.direction-step-arrow')
                if(angle != -1){

                    templ_arrow.css({
                        '-webkit-transform': 'rotate(' + angle + 'deg)',
                        '-moz-transform': 'rotate(' + angle + 'deg)',
                        '-ms-transform': 'rotate(' + angle + 'deg)',
                        '-o-transform': 'rotate(' + angle + 'deg)',
                        'transform': 'rotate(' + angle + 'deg)',
                        'zoom': 1
                    });
                }else
                {
                    templ_arrow.css({'display':'none'})
                }

                templ.appendTo('.direction-map-steps-container');
            };
        }
        
    },
    
    updateDirection:function(self)
    {
        var degree = self.heading - app.geoLocationService.device_bearing
        if(degree < 0)
            degree = 360 + degree

        if(degree > 360)
            degree = degree - 360

        $('.direction-content-arrow').css({
            '-webkit-transform': 'rotate(' + degree + 'deg)',
            '-moz-transform': 'rotate(' + degree + 'deg)',
            '-ms-transform': 'rotate(' + degree + 'deg)',
            '-o-transform': 'rotate(' + degree + 'deg)',
            'transform': 'rotate(' + degree + 'deg)',
            'zoom': 1
        });

        $('.direction-map-legend-arrow').css({
            '-webkit-transform': 'rotate(' + degree + 'deg)',
            '-moz-transform': 'rotate(' + degree + 'deg)',
            '-ms-transform': 'rotate(' + degree + 'deg)',
            '-o-transform': 'rotate(' + degree + 'deg)',
            'transform': 'rotate(' + degree + 'deg)',
            'zoom': 1
        });

        

        //$('.direction-map-debug').html('device bearing: '+app.geoLocationService.device_bearing)
    },

    createMap:function(){
        var self = this;
        var walking_tour = app.dataService.getWalkingTourbyID(app.walking_tour_id);
        var ship_lat = walking_tour.ship_latitue;
        var ship_long = walking_tour.ship_longitude;

        var centerOfMap = new google.maps.LatLng(ship_lat,ship_long);
  
        self.mapOptions = {
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

        this.map = new google.maps.Map($("#direction-map")[0], this.mapOptions);
        
        self.userMarker = new google.maps.Marker({  
            position: new google.maps.LatLng(app.geoLocationService.raw_user_latitude, app.geoLocationService.raw_user_longitude),  
            map: self.map,
            icon:'img/marker/marker_map_position.png'
            
        });

        
        
        
        self.shipMarker = new google.maps.Marker({  
            position: new google.maps.LatLng(ship_lat, ship_long),  
            map: self.map,
            icon:'img/marker/marker-balloon-ship-red.png'
            
        });

        

        
    
    },

    onCompass:function(self){
        $('#direction-map').css('display', 'none');
        $('.direction-content-compass').css('display', 'block');

        $('#direction-button-compass').css('display', 'none');
        $('#direction-button-map').css('display', 'block');
        $('.direction-map-steps-container').animate({'height':'0px'},500)
        //$('.direction-content-arrow').rotate({animateTo:self.heading})
        
       
    },

    onMap:function(self){
        $('#direction-map').css('display', 'block');
        $('.direction-content-compass').css('display', 'none');

        $('#direction-button-compass').css('display', 'block');
        $('#direction-button-map').css('display', 'none');
        $('.direction-map-steps-container').animate({'height':'180px'},500)
        if(self.map == null){
            self.createMap();
        }
        $('.direction-content .loading').show();
        self.updateRoute(self); 
    },



    updateUserMarker:function()
    {
        if(this.map && $('#direction-map').css('display') == 'block' && this.userMarker && app.dataService.isConnected() == true)
        {
            this.userMarker.setPosition( new google.maps.LatLng(app.geoLocationService.user_latitude, app.geoLocationService.user_longitude) );
        }   
    },


    onBack : function() {
        console.log("onBack");
        app.router.navigate('', {trigger: true});
    },

    finalize : function(){
        clearInterval(this.distanceInterval);
    },

    resize : function() {
        var map_height = $( window ).height() - 180;
        $('#direction-map').css({'height':map_height+'px'});
        var cont_height = $( window ).height() - 90;
         $('.direction-map').css({'height':cont_height+'px'});
    }

});