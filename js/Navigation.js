var Navigation = {

    init: function() {
        console.log("Nav init")
        var self = this;

        this.NAVIGATION_VIEWS = {};

        this.NAVIGATION_VIEWS[""] = HomeView;
        this.NAVIGATION_VIEWS["walks"] = ToursView;
        this.NAVIGATION_VIEWS["walking-tour"] = WalkingTourView;
        this.NAVIGATION_VIEWS["direction"] = DirectionView;
        this.NAVIGATION_VIEWS["map"] = PointsView;
        this.NAVIGATION_VIEWS["weather"] = WeatherView;

    }

};