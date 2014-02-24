var WeatherService = Backbone.Model.extend({

	distanceService: null,
    API_KEY: 'b17a025c653740fa3984545ce8728309',

    CITIES_ID: {
        "london": "2643743",
        "budapest": "3054643",
        "vienna": "2761369",
        "bratislava": "3060972"
    },

    getCurrentWeather: function(city) {
        // console.log("WeatherService init")
        var self = this;
        var cityId = this.getCityId(city);

        $.getJSON(
            'http://api.openweathermap.org/data/2.5/weather?id='+cityId+'&callback=?&units=imperial&APPID='+this.API_KEY, 
            function(e) { 
                self.onCurrentWeatherSuccess(e);
            }
        );

    },

    getDailyForecast: function(city, id) {
        // console.log("SERVICE getDailyForecast", city, id);
        var self = this;
        var cityId = this.getCityId(city);

        $.getJSON(
            'http://api.openweathermap.org/data/2.5/forecast/daily?id='+cityId+'&callback=?&units=imperial&APPID='+this.API_KEY, 
            function(e) { 

                self.onDailyForecastSuccess(e, city, id);
            }
        );
    },

    getHourlyForecast: function(city) {
        var self = this;
        var cityId = this.getCityId(city);

        $.getJSON(
            'http://api.openweathermap.org/data/2.5/forecast?id='+cityId+'&callback=?&units=imperial&APPID='+this.API_KEY, 
            function(e) { 

                self.onHourlyForecastSuccess(e);
            }
        );
    },


    getCityId: function(city) {
        var id = "";
        var city_str = city.toLowerCase();

        $.each( this.CITIES_ID, function( key, value ) {
          if(city_str==key){
            id = value;
            return id;
          }
        });

        return id;
    },


    // EVENTS

    onCurrentWeatherSuccess: function(e) {
        this.trigger("onCurrentWeatherSuccess", e);
    },

    onHourlyForecastSuccess: function(e) {
        this.trigger("onHourlyForecastSuccess", e);
    },

    onDailyForecastSuccess: function(e, city, id) {
        // console.log("SUCCESS", city, id);
        this.trigger("onDailyForecastSuccess", [e, city, id]);
    }
});