var locations = [{ name: 'St. Gerard Majella', address: '1969 Dougherty Ferry Rd, Kirkwood, MO',
						 location: {lat: 38.585765, lng: -90.440611}, markerId: 0},
                 { name: 'Vineyard Church', address: '2154 Dougherty Ferry Rd, Kirkwood, MO',
                 		 location: {lat: 38.582495, lng: -90.444763 }, markerId: 0},
                 { name: 'Des Peres Hospital', address: '2345 Dougherty Ferry Rd, Des Peres, MO',
                 		 location: {lat: 38.584928, lng: -90.452082 }, markerId: 0},
                 { name: 'West County Mall', address: '80 W County Center Dr, Des Peres, MO 63131',
                 		 location: {lat: 38.600515, lng: -90.44831 }, markerId: 0},
                 { name: 'Schnucks', address: '12332 Manchester Rd, Des Peres, MO',
                 		 location: {lat: 38.601464, lng: -90.442169 }, markerId: 0},
                 { name: 'Des Peres Park', address: '12325 Manchester Rd, Des Peres, MO',
                 		 location: {lat: 38.605765, lng: -90.442032 }, markerId: 0}];
var defaultIcon; // Google map marker icon for sites (blue)

var homes = [{name: 'Apprill', address: '2135 Apple Hill Ln', cityStateZip: 'Des Peres, MO 63122', markerId: 0},
			 {name: 'Obert', address: '2129 Apple Hill Ln', cityStateZip: 'Des Peres, MO 63122', markerId: 0},
			 {name: 'Moran', address: '2121 Apple Hill Ln', cityStateZip: 'Des Peres, MO 63122', markerId: 0},
			 {name: 'Wildermuth', address: '472 Tree Top Ln', cityStateZip: 'Des Peres, MO 63122', markerId: 0},
			 {name: 'Hartman', address: '482 Kassie View Ct', cityStateZip: 'Des Peres, MO 63122', markerId: 0}];
var neighborIcon; // Google map marker icon for neighbor's home (green)

var myAddress = '2141 Apple Hill Lane, Des Peres, MO';
var homeLocation;  // location from geocoding my address
var homeIcon; // Google map marker icon for my home (yellow)

// Create a new blank array for all the listing markers
var markers = [];

var map; // Google map object
var infoWindow; // Google map information window

// Filter box options
var types = ko.observableArray([]);
types.push({type: 'all', color: 'all'},
		   {type: 'site', color: 'blue'},
		   {type: 'home', color: 'green'});

// Location list constructor
var Location = function(data, type, color) {
	this.title = ko.observable(data.name);
	this.address = ko.observable(data.address);
	this.markerId = data.markerId;
	this.type = type;
	this.color = color;
}