var Router = Backbone.Router.extend({

    routes: {
        ':page'         : 'loadPage',
        'tours/:tour'   : 'loadTours',
        ''              : 'defaultPage',
        '*notFound'     : 'defaultPage'
    },
    defaultPage: function(){
        this.loadPage("");
    },
    loadPage: function(page){
        console.log("loadPage", page);

        if (this.currentView) 
        {   

            /*if (this.currentview != null && typeof(this.currentview.finalize) === 'function') { 
                this.currentView.finalize();
            }*/

            this.currentView.finalize();
            this.currentView.remove();
        }

        this.currentView = new Navigation.NAVIGATION_VIEWS[page];
        this.currentView.render();
        

        app.currentPage = page;
    },

    loadTours: function(tour){
        console.log("loadTours", tour);

        if (this.currentView) 
        {   
            if (this.currentview != null && typeof(this.currentview.finalize) === 'function') { 
                this.currentView.finalize();
            }
                
            this.currentView.remove();
        }

        this.currentView = new Navigation.NAVIGATION_VIEWS['walking-tour']
        this.currentView.id = tour
        this.currentView.render();
        

        app.currentPage = tour;
    },


});