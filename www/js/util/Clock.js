var Clock = Backbone.Model.extend({

	date: null,


    init: function() {
        this.date = new Date();
    },

    getHour: function() {
        this.date = new Date();
        var h= this.date.getHours();

        return h;
    },

    getMin: function() {
        this.date = new Date();
        var m= this.date.getMinutes();

        return m;
    },

    getFormattedTime: function() {
        this.date = new Date();

        var h= this.date.getHours();
        if(h>12){
            h-=12;
        }
        var time= this.pad(h, 2) +":" + this.pad(this.date.getMinutes(), 2);

        return time;
    },

    getTimeZoneID: function(){
        var offset = new Date().getTimezoneOffset()
        offset = ((offset<0? '+':'-')+ // Note the reversed sign!
                  this.pad(parseInt(Math.abs(offset/60)), 2)+
                  this.pad(Math.abs(offset%60), 2))
        return 'UTC '+offset;
    },

    pad: function(number, length){
        var str = "" + number
        while (str.length < length) {
            str = '0'+str
        }
        return str
    }


    // EVENTS

});