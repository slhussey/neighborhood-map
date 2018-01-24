// This is the call back from Google after the map API library has been loaded.
 function launchPage() {

    // Style the markers a bit. This will be our listing marker icon.
    defaultIcon = makeMarkerIcon('0091ff'); //Blue for sites
    homeIcon = makeMarkerIcon('FFFF24'); // Yellow for my home
    neighborIcon = makeMarkerIcon('00e600'); // Green for neighbor homes

    // Initialize the geocoder and instantiate a map information window
    var geocoder = new google.maps.Geocoder();
    infoWindow = new google.maps.InfoWindow();

    // Geocode my home address to get the center. Then, initialize the map via
    // the callback of the geocode API
    geocoder.geocode({
        address: myAddress,
        componentRestrictions: { locality: 'Missouri' }
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            initMap(results[0].geometry.location);
            homeLocation = results[0].geometry.location;
            getLocations();
        } else {
            window.alert('We could not find that location - try entering a more specific place.')
        }
    });

}

// Geocode the neighbor homes to convert street address to lat/lng
// Due to unknown reasons the sites (locations) are hard coded, as the geocode API
//   did not work correctly.
function getLocations() {
    // Initialize the geocoder.
    var geocoder = new google.maps.Geocoder();
    var coords = [];

    // Geocode the address for the neighbor homes
    for (var i=0, len=homes.length; i<len; i++) {
        var addr = homes[i].address + ', ' + homes[i].cityStateZip;
        geocoder.geocode({
            address: addr,
            componentRestrictions: { locality: 'Missouri' }},
            function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    coords.push(results[0].geometry.location);
                    if (coords.length == homes.length) {
                        createMarkers(coords);
                        ko.applyBindings(new MyView());
                    }
                } else {
                    window.alert('Error from geocode API (' + status + ') address: ' + addr)
                }
            });
    }
}

// Call back function after geocode completed for all neighbor homes.
function createMarkers(coords) {

    // Create map markers for each location (blue), storing the marker in the markers 
    // array at subscript of the marker ID and saving the marker ID in the locations
    // object so that the list has correlation to the marker.
    for (var i=0, len=locations.length; i<len; i++) {

        var marker = new google.maps.Marker({
                    map: map,
                    position: locations[i].location,
                    title: locations[i].name,
                    icon: defaultIcon,
                    animation: google.maps.Animation.DROP,
                    id: i+1});

        marker.addListener('click', function() {
            toggleBounce(this);
        });

        locations[i].markerId = i + 1;

        //Push the marker to our array of markers
        markers[locations[i].markerId] = marker;
    }

    // Create map marker for my home (yellow)
    var marker = new google.maps.Marker({
                    map: map,
                    position: homeLocation,
                    title: 'My Home',
                    icon: homeIcon,
                    animation: google.maps.Animation.DROP,
                    id: 0});

    markers[0] = marker;

    // Create map markers for each neighbor home (green), storing the marker in the markers 
    // array at subscript of the marker ID and saving the marker ID in the locations
    // object so that the list has correlation to the marker.
    for (var i=0, len=homes.length; i<len; i++) {

        var marker = new google.maps.Marker({
                    map: map,
                    position: coords[i],
                    title: homes[i].name,
                    icon: neighborIcon,
                    animation: google.maps.Animation.DROP,
                    id: i+1+locations.length});

        marker.addListener('click', function() {
            populateInfoWindow(this, infoWindow);
            toggleBounce(this);
        });

        homes[i].markerId = i + 1 + locations.length;

        markers[homes[i].markerId] = marker;
    }
}

// Create a Google map marker using the color specified 
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

// Knockout binding function
var MyView = function () {
    var self = this;  // retain MyViewModel 'this' to use in the inner function below

    this.locationList = ko.observableArray([]);
    this.filter = ko.observable({type: 'all', color: 'all'});

    locations.forEach(function(location) {
        self.locationList().push(new Location(location, 'site', 'blue'));
    });

    homes.forEach(function(home) {
        self.locationList().push(new Location(home, 'home', 'green'));
    });

    self.filteredList = ko.computed(function() {
        var color = self.filter().color;

        if (color === "all") {
            markers.forEach(function(marker) {
                marker.setMap(map);
            });
            return self.locationList();
        } else {
            var tempList = self.locationList().slice();

            return tempList.filter(function(location) {
                if (location.color != color) {
                    markers[location.markerId].setMap(null);
                } else {
                    markers[location.markerId].setMap(map);
                }
                return location.color === color;
            });
        }
    });

    self.bounceMarker = function(item) {
        marker = markers[item.markerId];
        toggleBounce(marker);
        
        if (item.markerId > locations.length) {
            populateInfoWindow(marker, infoWindow);
        }
    }
}

// This function populates the infowindow when the marker or list item is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        //infowindow.setContent('<div>' + marker.title + '</div>');
        //infowindow.open(map, marker);

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });

        var url = 'https://cors-anywhere.herokuapp.com/www.zillow.com/webservice/GetSearchResults.htm?zws-id=';
        url += 'X1-ZWz1g74vy96iob_adn99';
        url += '&address=' + homes[marker.id - 1 - locations.length].address;
        url += '&citystatezip=' + homes[marker.id - 1 - locations.length].cityStateZip;

        $.ajax({
            type: 'POST',
            url: url,
            dataType: 'xml',
            crossDomain: true,
            headers: {'Accept' : 'application/xml','Access-Control-Allow-Origin': '*'},
            success: function(result) {
              if (result) {
                var elementList = result.getElementsByTagName("zpid");
                var zpid = elementList[0].childNodes[0].nodeValue;

                elementList = result.getElementsByTagName("amount");
                var amount = elementList[0].childNodes[0].nodeValue;
                amount = parseFloat(amount);
                amount = amount.toLocaleString('en-US',{style: 'currency', currency: 'USD' });

                elementList = result.getElementsByTagName("homedetails");
                var url = elementList[0].childNodes[0].nodeValue;
                
                infowindow.setContent('<div>Zestimate value: ' + amount + 
                    '<br>See more details on <a href="' + url + '">Zillow</a></div>');

              } else {
                infowindow.setContent('<div>Failed to make Zillow API call.</div>');
              }
            },
            error: function(error) {
                infowindow.setContent('<div>Failed to make Zillow API call.<br>' + error + '</div>');
            }
          })
        

        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}


