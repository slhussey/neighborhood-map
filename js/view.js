// Instatiabte a Google map
function initMap(mapCenter) {

    map = new google.maps.Map(document.getElementById('map'),
        {
            center: mapCenter,
            mapTypeControl: false,  //  disable changing the map type
            zoom: 15
        });
}

// Event listener target function when a marker or list item is clicked.  Bounces
// the map marker.
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        (function(marker){
        // Retain `marker' in this scope, for use later (after timeout)
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);
         }) (marker);
    }
}

function failToLoadGoogleMapAPI() {
    $('#map').html('<h1>Map library failed to load</h1>');
}