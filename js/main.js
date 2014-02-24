var app = {

    walking_tour_id : 'walking-tour-budapest',

    init_map_service : false,
    init_geo_service : false,
    init_data : false,
    init_agenda : false,
    init_wikipedia : false,

    googleMapService:null,
    geoLocationService:null,
    dataService:null,
    agendaService:null,
    wikipediaService:null,
    weatherService:null,
    clock:null,

    dataInterval : null,

    preloaderView : null,
    backgroundView : null,
    isAgendaNotificationSeen:false,
    imgPath:"",
    
    init: function() {
        console.log("init", window.location.hostname);
        // $('#debug').append(window.location.hostname+"</br>");
        var self = this;

        if(window.location.hostname == "svn611.dev.unit9.net"){
            this.imgPath ="http://svn611.dev.unit9.net/app/img/";
        }else if(window.location.hostname == "svn611.test.unit9.net"){
            this.imgPath ="http://svn611.test.unit9.net/app/img/";
        }else{
            this.imgPath ="img/";
        }

        
        $('#debug').append("App init</br>");


        this.clock = new Clock();

        this.weatherService = new WeatherService();

        this.wikipediaService = new WikipediaService();
        this.wikipediaService.init();

        this.dataService = new DataService();
        this.dataService.init(this);
        this.dataService.setDatas();

        this.agendaService = new AgendaService();
        this.agendaService.init(this);

        this.googleMapService = new GoogleMapService();
        this.googleMapService.init();
        this.googleMapService.mapsLoaded();

        this.geoLocationService = new GeoLocationService();
        this.geoLocationService.init();    
        
        this.preloaderView = new PreloaderView();
        this.preloaderView.render();

        this.backgroundView = new BackgroundView();
        this.backgroundView.render();
    },

    initComplete : function(){
        if(this.init_data == true)
        {

             this.wikipediaService.loadInitialData(this.walking_tour_id);
        }

        if(this.init_geo_service == true  
            && this.init_map_service == true
            && this.init_data == true 
            && this.init_agenda == true 
            && this.init_wikipedia == true
           )
        {
            // $('#debug').append("window width:"+window.innerWidth+'window height:'+window.innerHeight);
            this.preloaderView.finalize();
            this.backgroundView.changeBackground('img/background/background-home.jpg');
            $('#debug').append("init complete !</br>");
            $('#debug').remove();

            Navigation.init();

            this.currentPage="";
            this.router = new Router();
            Backbone.history.start();

            document.addEventListener("pause", this.onPause, false);

            var self = this;

            this.dataInterval = setInterval(function () {
                self.dataService.updateConnectionStatus();
                // console.log("connected", self.dataService.isConnected());
            }, 5000);


        }


       
    },

    onPause: function(page) {
        // $('.header .geolocation').html("pause");
    }


};


$(function() {

    $('#debug').hide();
    $('#debug').append("loading services ...</br>");

    if(window["google"]&&google.maps){
        // $(document).trigger("gmaps:available");
        $('#debug').append("MapService</br>");
        setup();
        gmapsLoaded = true;
        return true;
    }else{
        $('#debug').append("MapService failed</br>");
        setTimeout(function () { showConnectionAlert(); }, 2000);

    }
    var gmaps = document.createElement("script");
    gmaps.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA1waQCfoRmTbhOL9IzpbQtbt4g3JX3FxM&v=3.exp&sensor=true&language=en&callback=gmapsPluginLoaded";
    // Updated API url
    $("head").append(gmaps);
    window["gmapsPluginLoaded"] = function () {
        // $(document).trigger("gmaps:available");
        $('#debug').append("MapService (forced)</br>");
        setup();
        gmapsLoaded = true;
    }

    
});

function showConnectionAlert(){

    $('#debug').append("showConnectionAlert ");

    navigator.notification.alert(
        'Internet connection is required.',
        function(){
            navigator.app.exitApp();

        },
        'Connection not found',
        'Close the app'
    );

}

function onDeviceReady(){
    console.log("onDeviceReady")
    $('#debug').append("Device Ready</br>");

    app.init();
}

function onAppPause(){
    
    // app.trigger("onAppPause", e);
}

function setup(){
    if(!isSetup_bl){
        // $('#debug').append("MapService</br>");
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            document.addEventListener("deviceready", onDeviceReady, false);
            
        } else {
            onDeviceReady();
        }
    }
    
    isSetup_bl = true;
}

var isSetup_bl=false;


