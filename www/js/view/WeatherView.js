var WeatherView = Backbone.View.extend({

    hourlyView:false,
    weatherScroll:null,

    events: {
        'click .bt-back': 'onBack'
    },


    initialize : function() {
        self = this;
        $(window).on("resize", this.resize);

    },

    render : function() {
        self = this;

        var html = $("#weather-tpl").text();
        this.$el.html(html);

        this.$el.appendTo('#content');

        $('.weather .currentweather').append("<div class='loading'></div>");
        this.createForecastView();
        this.createHourlyView();

        app.weatherService.on("onCurrentWeatherSuccess", function(datas) {
          self.updateCurrentWeather(datas);
        });

         app.weatherService.on("onHourlyForecastSuccess", function(datas) {
          self.updateHourlyForecast(datas);
        });

        app.weatherService.on("onDailyForecastSuccess", function(datas) {
          self.updateDailyForecast(datas[0], datas[1], datas[2]);
        });

        $('.weather .toggle-icon').bind('click', function(event) {
            event.preventDefault();
            self.toogleView();
        });

        app.weatherService.getCurrentWeather("Budapest");
        app.weatherService.getHourlyForecast("Budapest");
        // self.toogleView();
    },

    updateCurrentWeather : function(datas){

        app.weatherService.off("onCurrentWeatherSuccess");
        $('.weather .currentweather .loading').remove();
        // console.log(datas);

        var time = new Date();

        var time_text = '<span class="time">'+app.clock.getFormattedTime()+'</span>';
        if(app.clock.getHour() > 12)
            time_text += '<span class="info">'+' pm'+'</span>';
        else
            time_text += '<span class="info">'+' am'+'</span>';


        var img = app.imgPath+"weather/"+datas.weather[0].icon.substr(0,2)+".png";
        var country=app.dataService.getGountryByCode(datas.sys.country);

        $('.weather .currentweather .city').append(datas.name + ", " + country);
        $('.weather .currentweather .date').append(app.dataService.weekday[time.getDay()] +", " + app.dataService.months[time.getMonth()-1] + " " + time.getDate());
        $('.weather .currentweather .time').append(time_text);

        var weathericon = "<img src='"+img+"' />"
        var weathtemperature = datas.main.temp.toFixed(1)+"°";

        $('.weather .currentweather .dailyweather .icon').append(weathericon);
        $('.weather .currentweather .dailyweather .temp').append(weathtemperature + "<div class='unit'>F</div>");
        // $('.weather .currentweather .dailyweather').append();

        var tempmin = datas.main.temp_min;
        var tempmax = datas.main.temp_max;
        var wind = datas.wind.speed;
        var humidity = datas.main.humidity;
    
        $('.weather .currentweather .details').append("<div class='temp-icon'></div><div class='temps'><div class='high'>h "+ Math.round(tempmax) + "°</div><div class='low'>l " +Math.round(tempmin) +" °</div></div>") ;
        $('.weather .currentweather .details').append("<div class='wind-icon'></div><div class='wind'><div class='speed'>"+Math.round(wind)+"</div><div class='unit'>MPH</div></div>");
        $('.weather .currentweather .details').append("<div class='humid-icon'></div><div class='humidity'>"+humidity+" %</div>");
    },

    createForecastView : function(){
        var forecast_cont =  $('.weather .weeklyforecast');
        var days_ar = app.agendaService.getDays();

        for(var i=0; i<3; i++){
            var date = days_ar[i].day.substr(0,3).toUpperCase();
            var description = days_ar[i].city;

            forecast_cont.append("<div class='day' id='day_"+i +"'><div class='date'>"+date+"</div><div class='weather-icon'></div><div class='temp'><div class='high'></div><div class='low'></div></div><div class='city'>"+description+"</div></div>");

            app.weatherService.getDailyForecast(days_ar[i].city, i);

        }
        
        
    },

    createHourlyView : function(){
        var hourly_cont =  $('.weather .hourlyweather');
        for(var i=0; i<8; i++){

            hourly_cont.append("<div class='hour' id='hour_"+i +"'><div class='htime'></div><div class='weather-icon'></div><div class='temp'></div></div>");

        }
    },

    updateDailyForecast : function(datas, city, id){

        // var img = "http://openweathermap.org/img/w/"+datas.list[id].weather[0].icon+".png";
        var img = app.imgPath+"weather/"+datas.list[id].weather[0].icon.substr(0,2)+".png"
        var icon_weather_html = "<img src='"+img+"' />";
        var tempmin = datas.list[id].temp.min;
        var tempmax = datas.list[id].temp.max;

        var h=tempmax.toFixed(1);
        var l=tempmin.toFixed(1);


        $('.weather .weeklyforecast #day_'+id+' .temp .high').html("h "+h+"°");
        $('.weather .weeklyforecast #day_'+id+' .temp .low').html("l "+l+"°");
        $('.weather .weeklyforecast #day_'+id+' .weather-icon').html(icon_weather_html);
        
    },

    updateHourlyForecast : function(datas){
        console.log(datas);
        for(var i=0; i<8; i++){
            var temp = Math.round(datas.list[i].main.temp) +"°<div class='unit'>F</div>";
            // var img = "http://openweathermap.org/img/w/"+datas.list[i].weather[0].icon+".png";
            var img = app.imgPath+"weather/"+datas.list[i].weather[0].icon.substr(0,2)+".png"
            var icon_weather_html = "<img src='"+img+"' />";
            var dt = datas.list[i].dt_txt;
            // var date = new Date(dt*1000);
            var hour_txt = dt.substr(11,5);

            $('.weather .hourlyweather #hour_'+i+' .htime').html(hour_txt);
            $('.weather .hourlyweather #hour_'+i+' .weather-icon').html(icon_weather_html);
            $('.weather .hourlyweather #hour_'+i+' .temp').html(temp);
        }

        var view_w = $( window ).width();
        $('.weather .hourlyweather').css('width', 160*i);
        $('#hourly-wrapper').css('width', view_w);

        this.weatherScroll = new iScroll('hourly-wrapper',{hideScrollbar:true, vScroll:false});
    },
    

    toogleView : function() {
        if(!this.hourlyView){
            $('.weather .dailyweather').hide();
            $('.weather .hourlyweather').show();
            if(this.weatherScroll) this.weatherScroll.refresh();
            if(this.weatherScroll) this.weatherScroll.scrollTo(0, 0, 200)
        }else{
            $('.weather .dailyweather').show();
            $('.weather .hourlyweather').hide();
        }
        this.hourlyView = !this.hourlyView
    },

    onBack : function() {
        app.router.navigate('', {trigger: true});
    },
   

    finalize : function(){
        app.weatherService.off("onCurrentWeatherSuccess");
        app.weatherService.off("onDailyForecastSuccess");
        app.weatherService.off("onHourlyForecastSuccess");
    },

    resize : function() {

        var view_w = $( window ).width();
        $('.weather .hourlyweather').css('width', 160*8);
        $('#hourly-wrapper').css('width', view_w);

        if(this.weatherScroll) this.weatherScroll.refresh();
    }

});