var WalkingTourView = Backbone.View.extend({
    cruise:null,
    id:null,
    data:null,
    checkpoints:null,
    markers:null,
    
    totalDistance:0,
    map:null,
    
    userMarker:null,
    userCurrentLocation:null,
    shipMarker:null,
    checkpointsDistance:[],
    checkpointsShowed:[],
    checkpoint_checked:0,
    closestMarker:null,
    closestMarkerDistance:null,

    wikipedia_short_text:'',
    wikipedia_long_text:'',
    wikipedia_is_open:'',

    distanceInterval:null,
    updatingDistance:false,
    galleryScroll:null,
    currentId:0,

    audioInstance:null,
    audioInterval:null,
    audioDuration:null,
    audioDurationInterval:null,
    currentAudioURL:'',
    audio_is_open:false,
    audio_is_played:false,
    path:null,

    // map_margin:400,
    map_margin:300,
    events: {
        'click .bt-back': 'onBack',
        'click .autotour-bt': 'onStartSimulation',
        'click .checkpoint-wikipedia':'onWikipediaContent',
        'click .checkpoint-container-close': 'onWikipediaClose',
        'click .checkpoint-audio': 'onOpenAudioPanel',
        'click .tour-notification-button-close':'onCloseNotification',
        'click .tour-notification-button-listen': 'onOpenAudioPanel',
        'click .audio-close': 'onCloseAudioPanel',
        'click .audio-play-button': 'onAudioPlay',
        'click .audio-pause-button': 'onAudioPause'
        
        
    },

    initialize : function(id) {
        var self = this;
    },

    render : function() {

        var self = this;
        $(window).on("resize", {self:self},this.resize);
        document.addEventListener("pause", this.onAppPause.bind(this), false);
        

        this.data = app.dataService.getWalkingTourContentbyID(this.id);

        var html = $("#walking-tour-content").text();
        this.$el.html(html);
        this.$el.appendTo('#content');
        
        //html = $(html);
        $('#walking-tour-content-header').html(this.data.title+' - '+this.data.duration);
        $('.autotour-bt').css({'display':'none'});

        //MAP INIT
        var walking_tour = app.dataService.getWalkingTourbyID(app.walking_tour_id);
        var ship_lat = walking_tour.ship_latitude;
        var ship_long = walking_tour.ship_longitude;


        var centerOfMap = new google.maps.LatLng(ship_lat,ship_long);
  
        var mapOptions = {
            zoom: 14,
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
            }
              
        };

        this.map = new google.maps.Map($("#walking-tour-map")[0], mapOptions);
        this.markers = [];
        this.checkpoints = [];

       

        for (var i = 0; i < self.data.checkpoints.length; i++) {
            //console.log(this.data.checkpoints[i].long)
            var cp = new google.maps.LatLng(Number(this.data.checkpoints[i].lat), Number(this.data.checkpoints[i].long));
            this.checkpoints[i] = cp;
            this.checkpointsShowed[i] = false;
            
            //DATA INIT
            if(this.data.checkpoints[i].wikipedia)
            {
                app.wikipediaService.getContent(this.onGetWikiContent ,this.data.checkpoints[i].wikipedia)
            }


        };
        

        var rendererOptions = {
            suppressMarkers:true,
            preserveViewport: true,
            polylineOptions:{
                strokeColor: '#b10a32',
                strokeOpacity: .8,
                strokeWeight: 3
             }
        }
    

        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);    
        directionsDisplay.setMap(this.map);
          
        var wayPoints = [];
        for (var i = 0; i < this.checkpoints.length; i++) {
            wayPoints.push({location: this.checkpoints[i], stopover: true});
            //console.log(this.checkpoints[i])
        };
        

        var request = {
            // origin: this.checkpoints[0],
            origin: new google.maps.LatLng(Number(ship_lat), Number(ship_long)),
            destination: this.checkpoints[this.checkpoints.length-1],
            waypoints: wayPoints,
            travelMode: google.maps.DirectionsTravelMode.WALKING,
        };

        // app.geoLocationService.initSimulation();

        directionsService.route(request,function(result, status) {                
            if(status == google.maps.DirectionsStatus.OK){              
                directionsDisplay.setDirections(result);
                self.totalDistance = self.calculateTotalDistance(result);
                
                if(app.geoLocationService.enable_location_simulation == true)
                {
                    // app.geoLocationService.enableUserSimulation(result.routes[0].overview_path);
                }

                var lat_min = ship_lat-.1;
                var lat_max = ship_lat+.1;
                var long_min = ship_long-.1;
                var long_max = ship_long+.1;

                self.path = result.routes[0].overview_path;

                if( app.geoLocationService.user_latitude>lat_min &&  app.geoLocationService.user_latitude<lat_max && app.geoLocationService.user_longitude >long_min && app.geoLocationService.user_longitude<long_max){
                    console.log("YOU'RE IN BUDAPEST !");
                    $('.autotour-bt').css({'display':'none'});
                    
                }else{
                    console.log("YOU'RE NOT IN BUDAPEST !");
                    $('.autotour-bt').css({'display':'block'});
                }

               
                
                for (var i = 0; i < self.data.checkpoints.length; i++) {
                    
                    var div = $('#walking-tour-custom-checkpoint').text();
                    div = $("<div>"+div+"</div>");
                    var titl = div.find('.checkpoint-title');
                    $(titl).attr('id','checkpoint-title'+i);
                    $(titl).html(self.data.checkpoints[i].title);
                    div = div[0].innerHTML;
                    
                    /*
                    self.markers[i] = new RichMarker({  
                        position: new google.maps.LatLng(self.data.checkpoints[i].lat,self.data.checkpoints[i].long),  
                        map: self.map,
                        title: self.data.checkpoints[i].title,
                        anchor: RichMarkerPosition.LEFT,
                        content: div
                    });
                    */

                    self.markers[i] = new google.maps.Marker({
                        position: new google.maps.LatLng(self.data.checkpoints[i].lat,self.data.checkpoints[i].long), 
                        map: self.map,
                        title: self.data.checkpoints[i].title,
                        icon: 'img/marker/map-marker-red-small'+(i+1)+'.png'
                    });
                    if(i == 0)
                        self.markers[i].setIcon('img/marker/map-marker-black1.png')
                    
                    self.markers[i].id = i;
                    self.markers[i].setShadow('0px 0px 0px rgba(88,88,88,0)')
                    console.log(self.data.checkpoints[i].title)
                   
                    google.maps.event.addListener(self.markers[i], "click", function(e){
                        console.log(self);
                        self.onMarkerClick(this.id);
                    });


                    $('#checkpoint-title'+i)
                };
                
            }
            else
                console.log("[ERROR] - DirectionsService() : " + status);
        });
        
        
        self.userMarker = new google.maps.Marker({  
            position: new google.maps.LatLng(app.geoLocationService.user_latitude, app.geoLocationService.user_longitude),  
            map: self.map,
            icon:'img/marker/marker_map_position.png'
            
        });


        var walking_tour = app.dataService.getWalkingTourbyID(app.walking_tour_id);
        
        self.shipMarker = new google.maps.Marker({  
            position: new google.maps.LatLng(ship_lat, ship_long),  
            map: self.map,
            icon:'img/marker/marker-balloon-ship-red.png'
            
        });

        this.resize();
        this.createGallery();
        
        this.onUpdateUserDistance();
        this.startUpdatingUserDistance();
        this.changeContentId(0);
        
        

    },

    
    onStartSimulation:function(event)
    {
        app.geoLocationService.enable_location_simulation = true;
        app.geoLocationService.enableUserSimulation(this.path);
        $('.autotour-bt').css({'display':'none'});
    },

    onPositionSuccess:function(position)
    {
        console.log("location success");
    },

    onPositionError:function()
    {
        console.log("location error");
    },

    startUpdatingUserDistance:function()
    {
        var self = this;
         this.distanceInterval = setInterval(function () {
            self.onUpdateUserDistance();
            self.updateUserMarker();
        }, 2000);
    },

        

    stopUpdatingUserDistance:function()
    {
        clearInterval(this.distanceInterval);
    },

    onUpdateUserDistance:function()
    {
        if(this.updatingDistance == false)
        {

            this.updatingDistance = true;
            checkpoint_checked = 0;
            var self = this;
            for (var i = 0; i < self.data.checkpoints.length; i++) {
                
                app.googleMapService.getDistanceBetweenLocation(this, this.onGetUserLocation,i,app.geoLocationService.user_latitude,app.geoLocationService.user_longitude,self.data.checkpoints[i].lat,self.data.checkpoints[i].long )
                    
            };
        }
       
    },

    onGetUserLocation:function(self, response, param)
    {
        self.checkpoint_checked++;
        self.checkpointsDistance[param] = response.rows[0].elements[0];
        
        self.userCurrentLocation = response.originAddresses[0];
        //console.log(response);
        if(self.checkpoint_checked == self.data.checkpoints.length)
        {
            self.checkpoint_checked = 0;
            self.updatingDistance = false;
            var closestDistance = 10000000000;
            var closestDistanceId = -1;
            for (var i = 0; i < self.data.checkpoints.length; i++) 
            {
                if(self.checkpointsDistance[i].status != "ZERO_RESULTS")
                {
                     var dist = self.checkpointsDistance[i].distance.value;
                    //console.log(dist);
                    if(dist < closestDistance)
                    {
                        closestDistance = dist;
                        closestDistanceId = i;
                    }
                }
               
            }

            if(closestDistanceId != -1)
            {
                self.closestMarkerDistance = self.checkpointsDistance[closestDistanceId];
                self.closestMarker = self.data.checkpoints[closestDistanceId];

                $('.checkpoint-popup').html('Your closest checkpoint from '+self.userCurrentLocation+' is '+self.closestMarker.title+' which is '+self.closestMarkerDistance.distance.text)
                if(closestDistance <= 200 && self.checkpointsShowed[closestDistanceId] != true)
                {
                    
                    self.showNotification(closestDistanceId);
                    self.changeContentId(closestDistanceId);
                }
            }
            
        }
    },

    showNotification:function(checkpoint_id)
    {

        console.log("showNotification");

        this.stopUpdatingUserDistance();
        this.checkpointsShowed[checkpoint_id] = true;

        $('.tour-notification-title').html('<h1>Checkpoint '+(checkpoint_id+1)+' of '+this.checkpoints.length+'</h1>');
        $('.tour-notification-description').html('<h4>Checkpoint reached. Would you like to play the audio guide</h4>');
        $('.tour-notification').css({'display':'block'});

        if(app.geoLocationService.enable_location_simulation == true)
        {
            app.geoLocationService.pauseSimulation();
        }

        
    },

    onCloseNotification:function()
    {
        $('.tour-notification').css({'display':'none'});
        this.startUpdatingUserDistance();

        if(app.geoLocationService.enable_location_simulation == true)
        {
            app.geoLocationService.resumeSimulation();
        }
    },

    updateUserMarker:function()
    {
        if(this.userMarker)
        {
            this.userMarker.setPosition( new google.maps.LatLng(app.geoLocationService.user_latitude, app.geoLocationService.user_longitude) );
            // console.log("updateUserMarker", app.geoLocationService.user_latitude, app.geoLocationService.user_longitude);

        }   
    },

    onMarkerClick:function(id){
        //console.log('onMarkerClick'+id)
        this.changeContentId(id);
    },

    changeContentId:function(id)
    {
        var self = this;
        this.currentId = id;

        this.resize();
        this.updateGallery(id);

        $('.checkpoint-container-number').html(id+1)
        //img thumbs
        var img_url = this.data.checkpoints[id].thumbnail;
        var imgcontent = "<div class='zoom-icon'></div><img src='"+img_url+"' />";
        $('.img-container').html(imgcontent);

        var img_w = $( window ).width();

        $('.img-container img').css('clip', 'rect(0px, '+img_w+'px, 140px, 0px)')

        $('.img-container').bind('click', function(event) {
            self.onImgClick(self.currentId);
        });

        if(self.markers.length > 0)
        {
            for (var i = self.markers.length - 1; i >= 0; i--) {
                if(i != id)
                    self.markers[i].setIcon('img/marker/map-marker-red-small'+(i+1)+'.png')
            };
        }
        if(self.markers[id])
            self.markers[id].setIcon('img/marker/map-marker-black'+(id+1)+'.png')

        $('.checkpoint-container-title').html(this.data.checkpoints[id].title);

        if(this.data.checkpoints[id].wikipedia)
        {
            var c_title = this.data.checkpoints[id].wikipedia

            console.log("wikipedia", c_title);
       
            var content = app.wikipediaService.getContent(c_title);
            console.log("wikipedia content", content);
            content = $('<div>'+content.text['*']+'</div>')
            var cont2 = content.find('p');
            
            var wikipediaFirstP = content.find('p')[0].innerHTML;
            var div = document.createElement("div");
            div.innerHTML = wikipediaFirstP;
            var wikitext = div.textContent || div.innerText || "";

            // console.log(wikitext);
            self.wikipedia_short_text = wikitext.substr(0, 70);
            self.wikipedia_short_text +=  '...';
            self.wikipedia_long_text = ''

            for (var i = 0; i < cont2.length; i++) {
                self.wikipedia_long_text += '<p>'+cont2[i].textContent+'</p>' || '<p>'+cont2[i].innerText+'</p>' || "";
            };
            
            $('.checkpoint-container-close').css({'display':'none'});
            $('.checkpoint-container-text').html(self.wikipedia_short_text);
        }else
        {
            $('.checkpoint-container').html('');
        }
        
        clearInterval(this.audioInterval);
        //$('.checkpoint-audio').css({'display':'none'});

        if(this.data.checkpoints[id].media)
        {
            var media = this.data.checkpoints[id].media;
            for (var i = media.length - 1; i >= 0; i--) {
                if(media[i].type == 'audio')
                {
                    var src = media[i].url;

                    this.currentAudioURL = src;
                    $('.audio-play-button').css({'display':'none'});
                    $('.audio-pause-button').css({'display':'none'});
                    $('.audio-play-gif').css({'display':'block'});

                    this.audioLoadComplete(this)
                    
                }
            };
            
        }

    },

    onWikipediaClose:function(event){
         this.wikipedia_is_open = false;
        $('.checkpoint-container-close').css({'display':'none'});
        $('.checkpoint-container-text').html(this.wikipedia_short_text);
        var cont_height = $( window ).height() - this.map_margin;
        $('#walking-tour-map').animate({'height':cont_height+'px'},500);
        $('.checkpoint-container').css({'height':'90px'});
        $('.checkpoint-container-text').css({'height':'105px','overflow':'hidden', 'margin-right': '10px'});

        $('.checkpoint-footer').show();
    },

    onWikipediaContent:function(event){
        this.wikipedia_is_open = true;
        $('.checkpoint-container-close').css({'display':'block'});
        $('.checkpoint-container-text').html(this.wikipedia_long_text);

        var cont_height = $( window ).height() - 140;
        $('#walking-tour-map').animate({'height':'0px'},500);
        
        $('.checkpoint-container').css({'height':cont_height+'px'});
        $('.checkpoint-container-text').css({'height':(cont_height-40)+'px','overflow':'auto', 'margin-right': '40px'});

        $('.checkpoint-footer').hide();
        
        
    },

    createGallery:function(){

        var img_w = $( window ).width();
        var img_h = (img_w/540) * 367;

        var wrapperpos = -1*Math.round((img_h+60)*.5) +"px";

        $('#gallery-scroller').css('width', img_w);
        $('#gallery-wrapper').css({'width': img_w, 'height':img_h, 'margin-top': wrapperpos});

        this.galleryScroll = new iScroll('gallery-wrapper', {
            snap: true,
            momentum: false,
            hScrollbar: false,
            onScrollEnd: function () {
                document.querySelector('#indicator > li.active').className = '';
                document.querySelector('#indicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
            }
         });

        $('.gallery .close-bt').bind('click', function(event) {
            self.onGalleryClose();
        });


        $('.gallery').css({'visibility':'hidden'});
    },

    updateGallery:function(id){

        self = this;

        var img_cont =  $('.gallery #gallery-wrapper #gallery-scroller .images');
        var nav_cont =  $('.gallery #nav #indicator');

        img_cont.empty();
        nav_cont.empty();

        var gallery_length =  this.data.checkpoints[id].images.length;
        var img_w = $( window ).width();
        var img_h = (img_w/540) * 367;


        for(var i=0; i<gallery_length; i++){
            var img_url = this.data.checkpoints[id].images[i].url;
            img_cont.append("<img src='"+img_url+"' />");
            img_cont.find('img').css('width', img_w)

            if(i==0){
                nav_cont.append("<li class='active'>"+i+"</li>");
            }else{
                nav_cont.append("<li>"+i+"</li>");
            }
            
        }

        var navpos = gallery_length * -5;
        $('.gallery #nav').css('margin-left', navpos+"px");

        var wrapperpos = -1*Math.round((img_h+60)*.5) +"px";

        $('#gallery-scroller').css('width', img_w*i);
        $('#gallery-wrapper').css({'width': img_w, 'height':img_h, 'margin-top': wrapperpos});

        if(this.galleryScroll){

            self.galleryScroll.refresh();
        }


        $('.gallery .close-bt').bind('click', function(event) {
            self.onGalleryClose();
        });


        $('.gallery').css({'visibility':'hidden'});


    },

    scrollEnd:function(event){
        
    },

    
    onImgClick:function(id){
        $('.gallery').css({'visibility':'visible'});
        $('#walking-tour-content-header').hide();
        $('.bt-back').hide();
        $('.checkpoint-audio-player').hide();
    },

    onGalleryClose:function(event){
        this.galleryScroll.scrollToPage(0, 0);
        $('.gallery').css({'visibility':'hidden'});
        $('#walking-tour-content-header').show();
        $('.bt-back').show();
    },

    audioLoadComplete:function(event){
        this.stopSound();
        $('.audio-play-gif').css({'display':'none'});
        var self = this;
        var sound_url = "/android_asset/www"+this.currentAudioURL

        //$('#debug').html('sound url'+sound_url);

        this.audioInstance = new Media(sound_url, function(){

        }, function(error){
            /*$('#debug').append('code: '    + error.code    + '\n' + 
                      'message: ' + error.message + '\n');*/
        });
       

        if(this.audio_is_open == true)
        {
            this.onAudioPlay();
        }else{
            this.onAudioPause();
        }
         
    },

    stopSound:function(){
        if(this.audio_is_played == true)
        {
            this.audioInstance.stop();
            clearInterval(this.audioInterval);
            clearInterval(this.audioDurationInterval);
            this.audio_is_played = false;
        }
    },


    onAudioPlay:function(){
        this.audioInstance.play();
        this.audio_is_played = true;

        var self = this;
        
         $('.audio-play-button').css({'display':'none'});
         $('.audio-pause-button').css({'display':'block'});
        
         this.audioDurationInterval = setInterval(function(){
            self.audioDuration = self.audioInstance.getDuration();
            //$('#debug').append('audio duration'+self.audioDuration);
            if(self.audioDuration  > 0)
            {
                var min = Math.floor(self.audioDuration/60);
                var sec = Math.floor(self.audioDuration - (min*60));

                $('.audio-time-total').html(min+':'+sec);
                clearInterval(self.audioDurationInterval);
            }
        })

        this.audioInterval = setInterval(function(){
            self.trackAudioPosition(self);
        },500)
    },

    trackAudioPosition:function(self){
        self.audioInstance.getCurrentPosition(
            // success callback
            function(position) {
                if (position > -1) {
                    var pos = Math.floor(position/1)
                    //$('#debug').append('audio current'+pos);
                    var min = Math.floor(pos/60);
                    var sec = Math.floor(pos - (min*60));
                    $('.audio-time-current').html(min+':'+sec);
                    if(self.audioDuration > 0)
                    {
                        var w = (position/self.audioDuration) * 90;
                        $('.audio-bar-progress').css({'width':w+'%'})
                        $('.audio-bar-progress-dot').css({'left':w+'%'})
                    }
                    
                }
            },
            // error callback
            function(e) {
                console.log("Error getting pos=" + e);
            }
        );
        /*
        var pos = Math.floor(self.audioInstance.getPosition()/1000)
        $('.audio-time-current').html(pos)
        var w = (self.audioInstance.getPosition()/self.audioInstance.getDuration()) * 90;
        
        $('.audio-bar-progress').css({'width':w+'%'})
        */
    },

    onAudioPause:function(){
        //createjs.Sound.stop(this.currentAudioURL);
        if(this.audioInstance)
            this.audioInstance.pause();

        this.audio_is_played = false;

        $('.audio-play-button').css({'display':'block'});
        $('.audio-pause-button').css({'display':'none'});

        clearInterval(this.audioInterval);
        clearInterval(this.audioDurationInterval);
    },

    onOpenAudioPanel:function(event){
        this.onCloseNotification();
        var cont_height = $( window ).height() - 353;
        $('#walking-tour-map').animate({'height':cont_height+'px'},500);
        $('.checkpoint-audio-player').css({'display':'block'});
        this.audio_is_open = true;

    },

    onCloseAudioPanel:function(event){
        var cont_height = $( window ).height() - this.map_margin;
        $('#walking-tour-map').animate({'height':cont_height+'px'},500);
        $('.checkpoint-audio-player').css({'display':'none'});
        this.onAudioPause();
        this.audio_is_open = false;
    },

    calculateTotalDistance: function (result){
        var totalDistance = 0;
        //console.log(result);
        for(var i=0; i< this.checkpoints.length-1; i++){
            totalDistance += result.routes[0].legs[i].distance.value;
        }
        return totalDistance
    },

    onBack : function() {
        console.log("onBack");
        app.router.navigate('walks', {trigger: true});
    },

    finalize : function(){
        // this.stopSound();
        this.onCloseAudioPanel(null);
        clearInterval(this.distanceInterval);
        app.geoLocationService.stopSimulation();
        document.removeEventListener("pause", this.onAppPause.bind(this), false);
    },

    
    onAppPause : function() {
        this.onCloseAudioPanel(null);
    },
    

    resize : function(event) {
        var self = this;

        if(event && event.data && event.data.self)
            self = event.data.self

        if(self.wikipedia_is_open == true){
            var cont_height = $( window ).height() - 140;
            console.log($( window ).height())
            console.log(cont_height);
             
            $('#walking-tour-map').css({'height':'70px'});
            $('.checkpoint-container').css({'height':cont_height+'px'});
            $('.checkpoint-container-text').css({'height':(cont_height-30)+'px','overflow':'auto'});
        }else if(self.audio_is_open == true)
        {
            var cont_height = $( window ).height() - 353;
            $('#walking-tour-map').css({'height':cont_height+'px'});
        }else{
             var cont_height = $( window ).height() - self.map_margin;
            $('#walking-tour-map').css({'height':cont_height+'px'});
        }
    }

});