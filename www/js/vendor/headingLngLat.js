Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

Number.prototype.toDeg = function() {
   return this * 180 / Math.PI;
}

google.maps.LatLng.prototype.getHeading = function(point) {
   var lat1 = this.lat().toRad(), lat2 = point.lat().toRad();
   var dLon = (point.lng() - this.lng()).toRad();

   var y = Math.sin(dLon) * Math.cos(lat2);
   var x = Math.cos(lat1) * Math.sin(lat2) -
           Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

   var brng = Math.atan2(y, x);

   return ((brng.toDeg() + 360) % 360);
}