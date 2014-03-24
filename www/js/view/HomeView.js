var HomeView = Backbone.View.extend({

    timeInterval:null,

    events: {
        'click .agenda-notification-button-close':'onCloseNotification'
        
        
    },

    initialize : function() {
        // console.log("initialize");

        this.homeScroll;
        this.agendaScroll;
        this.isScrolling_bl=false;
        this.watchID = null;
        this.isAgendaOn = false;

        $(window).on("resize", this.resize);

    },

    render : function() {

        // console.log("render");

        self = this;

        var html = $("#home-tpl").text();
        this.$el.html(html);

        this.$el.appendTo('#content');
        this.createDailyAgenda();
        this.createTripAgenda();

        $('.tripagenda').hide(0);
        $('.agenda-slide').hide(0);
        // $('.agenda-notification').hide(0);

        this.resize();

        this.homeScroll = new iScroll('scrollwrapper', {onScrollMove:function(){self.scrollMove()},  onScrollEnd:function(){self.scrollEnd()}, hideScrollbar:true });
        this.agendaScroll = new iScroll('agendascrollwrapper',{hideScrollbar:true});
        

        $('#walks').bind('click', function(event) {
            if(self.isScrolling_bl) return;
            
            app.router.navigate('#/walks', {trigger: true});
        });

        $('#directions').bind('click', function(event) {
            if(self.isScrolling_bl) return;
            
            app.router.navigate('#/direction', {trigger: true});
        });

         $('#map').bind('click', function(event) {

        });

         $('#weather').bind('click', function(event) {
            if(self.isScrolling_bl) return;
            
            app.router.navigate('#/weather', {trigger: true});
        });

         $('.header .currentweather').bind('click', function(event) {
            if(self.isScrolling_bl) return;
            
            app.router.navigate('#/weather', {trigger: true});
        });

         
        $('.agenda-widget').bind('click', function(event) {
            self.toogleAgendaSlide();
        });

        $('.tabs .daily').bind('click', function(event) {
            self.toogleAgendas("daily");
        });

        $('.tabs .trip').bind('click', function(event) {
            self.toogleAgendas("trip");
        });

        app.weatherService.on("onCurrentWeatherSuccess", function(datas) {
          self.updateWeather(datas);
        });

        app.weatherService.on("onDailyForecastSuccess", function(datas) {
          self.updateDailyForecast(datas[0], datas[1], datas[2]);
        });

        app.weatherService.getCurrentWeather("Budapest");

        // this.toogleAgendaSlide();
        $('.agenda-widget .arrow').toggleClass("arrow-down");
        $('.agenda-slide .daily').css('border-bottom', '#bf002c solid 4px')
        
        this.updateTime();
        timeInterval = setInterval(this.updateTime, 30000);

    },

    updateTime : function(){
        var time_text = '<span class="time">'+app.clock.getFormattedTime()+'</span>';
        if(app.clock.getHour() > 12)
            time_text += '<span class="info">'+'PM '+'</span>';
        else
            time_text += '<span class="info">'+'AM '+'</span>';

        time_text+='<span class="info">('+app.clock.getTimeZoneID()+')</span>'
        $('.currenttime').html(time_text);
    },

    updateLocation : function(){
        var timestamp = new Date(GeoLocationService.timestamp)

        var geohtml = 'Latitude: '  + GeoLocationService.user_latitude
        +'<br>' +'Longitude: ' + GeoLocationService.user_longitude 
        +'<br>' + 'Accuracy: ' + GeoLocationService.user_accuracy + " meters"
        +'<br>' + 'Speed: ' + GeoLocationService.user_speed + " m/s"
        +'<br>' + 'Timestamp: ' + timestamp.toUTCString();
        + '<br>'


        // $('.header .geolocation').html(geohtml);
    },

    updateWeather : function(datas){

        var time = new Date();
        var img = app.imgPath+"weather/"+datas.weather[0].icon.substr(0,2)+".png";
        var country=app.dataService.getGountryByCode(datas.sys.country);

        var weatherhtml = "<div class='unit'>F</div> <div class='temperature'>" +datas.main.temp.toFixed(1)+"°</div><img src='"+img+"' />"
        // var weatherhtml = "<div class='unit'>F</div> <div class='temperature'>" +datas.main.temp.toFixed(1)+"°</div><div class='icon'></div>"
        +"<div class='city'>" + datas.name + ", " + country + "</div>"
        // +"<div class='description'>"+ datas.weather[0].description + "</div>"
        +"<div class='date'>" + app.dataService.weekday[time.getDay()] +", " + app.dataService.months[time.getMonth()-1] + " " + time.getDate() + "</div>";

        $('.header .currentweather').html(weatherhtml);

        // $(".header .currentweather .icon").css( "background", "url("+img+") no-repeat" );

    },

    updateDailyForecast : function(datas, city, id){
        // console.log("updateDailyForecast", city, id);

        var dt = datas.list[id].dt;
        var time = new Date(dt*1000);
        // console.log("time", time);

        var img = app.imgPath+"weather/"+datas.list[id].weather[0].icon.substr(0,2)+".png"
        var icon_weather_html = "<img src='"+img+"' />";
        $('#day_'+id+' .weather-icon').html(icon_weather_html);
        
    },

    

    createDailyAgenda : function(){

        var daily_cont =  $('#agendascrollwrapper .dailyagenda')

        for(var i=6; i<=22; i++){
            daily_cont.append("<div class='hour'><div class='number'><p>"+i+":00"+"</p></div><div class='line'><hr></div></div>");
        }

        var events_ar = app.agendaService.getEvents();
        daily_cont.append("<div class='container'></div>");
        var daily_cont =  $('#agendascrollwrapper .dailyagenda .container')

        for(var i=0; i<events_ar.length; i++){
            // console.log(events_ar[i]);

            var hour_h = 60;

            var start = parseFloat(events_ar[i].start);
            var h = ((events_ar[i].end - start) * hour_h) - 4;
            var top = 15 + ((start - 6) * hour_h) + 4;
            var w = $( window ).width() - 70 -20;

            var bgcolor=null;
            var txtcolor=null;
            switch(events_ar[i].type)
            {
            case "food":
              bgcolor = "rgba(255,255,255,0.7)"
              txtcolor = "#000"
              break;
            case "tours":
              bgcolor = "rgba(220,220,220,0.7)"
              txtcolor = "#000"
              break;
            case "important":
              bgcolor = "rgba(214,16,40, .9)"
              txtcolor = "#fff"
              break;
            default:
              bgcolor = "rgba(255,255,255,0.7)"
              txtcolor = "#000"
            }

            daily_cont.append("<div class='agendabox' id='"+ events_ar[i].id +"'><div class='description'>"+events_ar[i].description+"</div></div>");

            $("#"+events_ar[i].id).css( "position", "absolute" );
            $("#"+events_ar[i].id).css( "top", top+"px" );
            $("#"+events_ar[i].id).css( "left", "70px" );
            $("#"+events_ar[i].id).css( "width", w+"px" );
            $("#"+events_ar[i].id).css( "height", h+"px" );
            $("#"+events_ar[i].id).css( "background-color", bgcolor );
            $("#"+events_ar[i].id+ ".agendabox .description").css( "color", txtcolor );

            if(i>0){
                var prevend = parseFloat((events_ar[i-1].end));

                if(prevend>start){
                    var w = ($( window ).width()  - 70)*.5 -10;
                    var w2 = ($( window ).width()  - 70)*.5 - 10;
                    var l = ($( window ).width()  - 70)*.5 + 60;
                    $("#"+events_ar[i].id).css( "left", l+"px" );
                    $("#"+events_ar[i].id).css( "width", w2+"px" );
                    $("#"+events_ar[i-1].id).css( "width", w+"px" );
                }

            }
            
        }

        
        this.getImportantEvents();
    },

    getImportantEvents : function(){

        var events_ar = app.agendaService.getEvents();

        for(var i=0; i<events_ar.length; i++){

            if(events_ar[i].type == "important"){

                var time = events_ar[i].start;
                var min = (time % 1)*60;
                var hour = Math.floor(time);
                console.log(hour, min);


                if(app.clock.getHour()<hour){

                    this.setNextImportantEvent(events_ar[i].description, hour, min);
                    return;

                }else if(app.clock.getHour()==hour && app.clock.getMin()<min){
                    this.setNextImportantEvent(events_ar[i].description, hour, min);
                    return;

                }else{
                    this.setNextImportantEvent("", 0, 0);
                }

            }

        }

        
    },

    setNextImportantEvent : function(text, h, m){
        console.log("Next Important Event", text, h, m);

        var remainingHours = h - app.clock.getHour();
        var remainingMin =  m - app.clock.getMin();

        if(remainingMin<0){
            remainingMin += 60;
            remainingHours --;
        }

        var remainingMinuntes = app.clock.pad(remainingMin, 2)
        

        var nextevent = text + " in " + remainingHours +"h"+ remainingMinuntes + "m";
        if(text==""){
            remainingHours = 12;
            nextevent = "Day is over, see you tomorrow !";
        }
        
        $('.agenda-widget .event').html(nextevent);

        if(remainingHours<1 && !app.isAgendaNotificationSeen){
            this.showNotification(nextevent);
        }

        
    },

    showNotification:function(nextevent)
    {

        $('.agenda-notification-title').html('<h1>Important reminder</h1>');
        $('.agenda-notification-description').html('<h4>'+nextevent+'</h4>');
        $('.agenda-notification').css({'display':'block'});

    },

    onCloseNotification:function()
    {
        $('.agenda-notification').css({'display':'none'});
        app.isAgendaNotificationSeen = true;
        
    },

    createTripAgenda : function(){
        var trip_cont =  $('#agendascrollwrapper .tripagenda');
        var days_ar = app.agendaService.getDays();

        for(var i=0; i<days_ar.length; i++){
            var date = days_ar[i].month + "/" + days_ar[i].date;
            var day = days_ar[i].day.substr(0,3).toUpperCase();
            var name = days_ar[i].city;
            var description = days_ar[i].description;

            trip_cont.append("<div class='day' id='day_"+i +"'><div class='date'><div class='month'>"+date+"</div><div class='dayletters'>"+day+"</div></div><div class='weather-icon'></div><div class='city'><div class='name'>"+name+"</div><div class='desc'>"+description+"</div></div></div>");

            app.weatherService.getDailyForecast(days_ar[i].city, i);

        }
        
    },

    toogleAgendaSlide : function(){
        self=this;
        if(this.isAgendaOn){
            $('.agenda-slide').hide(200);
            $('.menu').show(200);
        }else{
            $('.agenda-slide').show(200);
            $('.menu').hide(200);
            
            setTimeout(function () { self.agendaScroll.refresh(); }, 300);
        }

        $('.agenda-widget .arrow').toggleClass("arrow-down");
        $('.agenda-widget .arrow').toggleClass("arrow-up");
        this.isAgendaOn = !this.isAgendaOn;

    },

    toogleAgendas : function(agenda){
        if(agenda == "daily"){
            $('.dailyagenda').show(0);
            $('.tripagenda').hide(0);
            $('.agenda-slide .daily').css('border-bottom', '#bf002c solid 4px')
            $('.agenda-slide .trip').css('border-bottom', 'rgba(255, 255, 255, 0) solid 4px')
        }else{
            $('.dailyagenda').hide(0);
            $('.tripagenda').show(0);
            $('.agenda-slide .daily').css('border-bottom', 'rgba(255, 255, 255, 0) solid 4px')
            $('.agenda-slide .trip').css('border-bottom', '#bf002c solid 4px')
        }

        this.agendaScroll.refresh();
    },

    // SCROLL EVENTS
    scrollEnd : function() {
        self = this;
        setTimeout(function() {
            self.isScrolling_bl = false;
        }, 100)
    },

    scrollMove : function() {
        this.isScrolling_bl = true;
    },

    finalize : function(){
        app.weatherService.off("onCurrentWeatherSuccess");
        app.weatherService.off("onDailyForecastSuccess");
        clearInterval(this.timeInterval);
    },
    
    // RESIZE EVENT
    resize : function() {
        // console.log("resize");
        var icon_w = $( window ).width() * .3333;
        var text_h = icon_w+10;

        // $(".icon").height(icon_w);
        $(".innerContent").css( "line-height", text_h+"px" );

        var agenda_w = $( window ).width() - 70;
        $(".agenda-slide .dailyagenda .hour .line").css( "width", agenda_w+"px" );

        var agendatrip_w = $( window ).width() - 70 - 50 - 20;
        $(".agenda-slide .tripagenda .city").css( "width", agendatrip_w+"px" );
    }


});