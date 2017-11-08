var mapboxAccessToken = 'pk.eyJ1IjoiZWxiZXJ0d2FuZyIsImEiOiJjajk3dmw4amUwYmV2MnFydzl3NDIyaGFpIn0.46xwSuceSuv2Fkeqyiy0JQ';


var nyhivmap = L.map('nyhivmap', {zoomControl: true}).setView([40.760610, -73.925242], 11.5);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token='+mapboxAccessToken, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets',
    zoomSnap: 11.5
}).addTo(nyhivmap);
nyhivmap.zoomControl.setPosition('topright');
var geojson;


geojson = L.geoJson(nycneighborhoods, {
   	style: style,
    onEachFeature: function(feature, layer) {
    	var props = feature.properties;
 		feature.layer = layer;
        layer.on({
	        mouseover: highlightFeature,
	        mouseout: resetHighlight,
	        click: zoomToFeature
	    });

}}).addTo(nyhivmap)


function style(feature) {
    return {
    	fillColor: 'white',
        color: 'black', // border color 
        weight: 0.2,
        fillOpacity: 0
    }
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2.5,
        color: '#666',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function zoomToFeature(e) {
	console.log(e);
   	nyhivmap.fitBounds(e.target.getBounds());
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

var markers = L.markerClusterGroup();

d3.csv('data/HIV_Testing_Locations_geocoded.csv', function(data) {
	for (var i = 0; i < data.length; i++) {
		var lat = data[i]['Latitude']
		var lng = data[i]['Longitude']
		if (lat != "" && lng != "") {
			var marker = L.marker([lat, lng])
			var desc = '<span id="feature-popup">';
	        desc += '<strong>' + data[i]['Site Name'] + '</strong><br/>';

	        var address = data[i]['Address']
	        var city = data[i]['City']
	        var state = data[i]['State']
	        var zip = data[i]['Zip Code']
	        if (address != "" && city != "" && state != "" && zip != "") {
	            desc += address + ' ' + city + ', ' + state + ' ' + zip + '</br>';
	        }
	        
	        var phone = data[i]['Phone Number'];
	        if (phone != "") {
	            desc += 'phone: ' + phone +'</br>';
	        }
	        var website = "'" + data[i]['Website'] + "'"
	        if (website != "") {
				 desc += "Website: " + '<a target="_blank" href=' + website + '>link</a></br>';
				 
	        }
	        
	        desc += '</span>';
			marker.bindPopup(desc);
			markers.addLayer(marker);
		}

	}
	nyhivmap.addLayer(markers);
		
})
var options = { showResultFct: function(feature, container) {
        props = feature.properties;
        var name = L.DomUtil.create('b', null, container);
        name.innerHTML = props.name;
        container.appendChild(L.DomUtil.create('br', null, container));
        container.appendChild(document.createTextNode(props.details));
    }}


var info = L.control({position: 'bottomleft'});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Click on a neighborhood to zoom</h4>' +  (props ?
        '<b>' + props['BoroName'] + '</b><br />' + props['NTAName']
        : 'Hover for neighborhood name');
};

info.addTo(nyhivmap);


var searchControl = new L.Control.Search(
			{
				layer: geojson, 
				propertyName: 'NTAName', 
				marker: false,
				textPlaceholder: 'Search for your borough...',
				collapsed: false,
				position: 'topleft',
				moveToLocation: function(latlng, title, map) {
					//map.fitBounds( latlng.layer.getBounds() );
					var zoom = map.getBoundsZoom(latlng.layer.getBounds());
		  			map.setView(latlng, zoom); // access the zoom
				}
			});
searchControl.on('search:locationfound', function(e) {
		
		//console.log('search:locationfound', );

		//map.removeLayer(this._markerSearch)

		/*e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
		if(e.layer._popup)
			e.layer.openPopup();*/

	}).on('search:collapsed', function(e) {

		featuresLayer.eachLayer(function(layer) {	//restore feature color
			featuresLayer.resetStyle(layer);
		});	
	});
nyhivmap.addControl(searchControl);  //inizialize search control





