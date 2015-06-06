/*
 * Lots of setup!!
 */
var dataUrl = 'incidents.json',
    tooltipTemplate = $('#tooltip-template').html(),
    winWidth = $(window).width(),
    markerStyles = {
        active: { fillOpacity: 0.9 },
        inactive: { fillOpacity: 0.1 }
    },
    defaultOpacity = 0.5,
    defaultRadius = 4,
    hoverRadius = 8,
    maxZoom = 16,
    minZoom = 13,
    tolerance = 500,
    zoomRadius;

//Using ColorBrewer: http://colorbrewer2.org/?type=diverging&scheme=RdYlBu&n=4
var colors = ['rgb(215,25,28)','rgb(253,174,97)','rgb(171,217,233)','rgb(44,123,182)'];

if (winWidth > 980) {
    zoomRadius = {
        13: 2,
        14: 3,
        15: 4,
        16: 5
    };      
} else {
    zoomRadius = {
        13: 3,
        14: 3.5,
        15: 5,
        16: 7
    };
}

/*
 * The initial layers on the map
 */
var activeTypes = {
    'ASSAULT': true,
    'ROBBERY': true,
    'WEAPONS OFFENSE': true,
    'MISSING PERSON': true,
    'SEX CRIME': true,
    'ARSON': true,
    'KIDNAPPING': true,
    'HOMICIDE': true,

    'LARCENY': false,
    'LARCENY - FROM VEHICLE': false,
    'BURGLARY - VEHICLE': false,
    'BURGLARY - RESIDENTIAL': false,
    'BURGLARY - COMMERCIAL': false,
    'MOTOR VEHICLE THEFT': false,

    'VANDALISM': false,
    'FRAUD': false,

    'DISORDERLY CONDUCT': false,
    'DRUG VIOLATION': false,
    'LIQUOR LAW VIOLATION': false,
    'NOISE VIOLATION': false,
    'SUSPICIOUS': false,
    'RECOVERED VEHICLE': false,
    'FAMILY OFFENSE': false,
    'ALL OTHER OFFENSES': false
};

/*
 * Generate the layers object, set layers to active
 */
var types = Object.keys(activeTypes);
var layers = {};
for (var i = 0; i < types.length; i++) {
    layers[types[i]] = new L.LayerGroup();
    layers[types[i]].count = 0;
    layers[types[i]].active = activeTypes[types[i]];
}

/*
 * Set up the map
 */
var mapOptions = {
    minZoom: minZoom,
    maxZoom: maxZoom,
    maxBounds: [[37.825321, -122.391687],[37.919497, -122.175565]],
};        
var map = new L.Map('map-canvas', mapOptions),
    center = new L.LatLng(37.871137, -122.275730);

var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    detectRetina: true,
    opacity: 0.7,
}).addTo(map);

map.setView(center, 14);

/*
 * Loops through layers object, displaying the active ones
 */
var renderLayers = function() {
    for (type in layers) {
        if (layers[type].active) {
            layers[type].addTo(map);
        } else {
            map.removeLayer(layers[type])
        }
    }
}

/*
 * Takes an array of types, and changes each type from active to inactive and vice versa
 * Renders layers and filters based on location, which generates the graph
 */
var toggleLayers = function(types) {
    for (var i = 0; i < types.length; i++) {
        layers[types[i]].active = !layers[types[i]].active;
    }
    renderLayers();
    filterLocation();
}

/*
 * Yeah so this function does a lot. It loops through each marker in an active layer,
 * and if location filtering is active, it calculates the distance to the center of the circle
 * and sets the appropriate style. It also generates the months object that is sent to the graph
 * to be rendered. Finally, it updates the total count label.
 */
var filterLocation = function() {
    var counter = 0;
    var months = {};
    
    var addToMonths = function(month) {
        if (month in months) {
            months[month]++;
        } else {
            months[month] = 1;
        }
    }

    var updateChart = function(months) {
        var data = [];
        
        for (month in months) {
            data.push( { "amt": months[month], "date": d3.time.format('%m/%y').parse(month) });
        }
        
        function sortByDateAscending(a, b) {
            return a.date - b.date;
        }
        data = data.sort(sortByDateAscending);
        renderChart(data);
    }          

    for (type in layers) {
        if (layers[type].active) {
            var markers = layers[type].getLayers();
            for (var i = 0; i < markers.length; i++) {
                if (circleVisible) {
                    var center = circle.getLatLng();
                    var radius = circle.getRadius();
                    var point = markers[i].getLatLng();
                    var dist = center.distanceTo(point);
                    if (dist > radius) {
                        markers[i].setStyle(markerStyles.inactive);
                    } else {
                        markers[i].setStyle(markerStyles.active);
                        counter++;
                        addToMonths(markers[i].feature.properties.month);
                    }
                } else {
                    markers[i].setStyle(markerStyles.active);
                    counter++;
                    addToMonths(markers[i].feature.properties.month);
                }
            }
        }
    }
    $('#label').html(counter);
    updateChart(months);
}

/*
 * Accepts JSON data and generates CircleMarkers for each feature with the appropriate popups.
 */
var handleJSON = function(data) {
     /*
     * Creates popus for each marker
     */
    var onEachFeature = function(feature, layer) {
        var properties = feature.properties;
        var legend =  properties["legend"];

        var context = {
            address: properties["address"],
            caseno: properties["caseno"],
            date: properties["date"],
            time: properties["time"],
            offense: properties["offense"],
            severity: properties["severity"],
            legend: properties["legend"],
        };

        var popupContent = _.template(tooltipTemplate);
        popupContent = popupContent(context);
        layer.bindPopup(popupContent);

        layer.on('mouseover', function() { 
            this.setRadius(hoverRadius); 
        })
        .on('mouseout', function() {
            this.setRadius(zoomRadius[map.getZoom()]);
        });      
    };

    /*
     * Creates a CircleMarker for each point, setting the default visibility
     */
    var pointToLayer = function(feature, latlng) {
        var legend =  feature.properties["legend"],
            severity =  feature.properties["severity"],
            month = feature.properties["month"];

        var options = {
            stroke: false,
            color: colors[severity],
            zIndexOffset: severity,
        };

        var marker = new L.CircleMarker(latlng, options)
            .setRadius(zoomRadius[map.getZoom()]);

        layers[legend].addLayer(marker);
        layers[legend].count++;

        return marker;
    };

    L.geoJson(data.features, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer,
    });

    renderLayers();
    filterLocation();
}

/*
 * Circle and centerMarker allow the user to focus on Incidents within a certain radius.
 * They should always have the same location.
 */
var circleVisible = false,
    circle = L.circle(center, tolerance, {
        fill: false,
        weight: 2,
    }),
    centerMarker = L.marker(center, {
        draggable: true,
    });

var addCircle = function(center) {
    circleVisible = true;
    toleranceSlider.slider('enable');
    circle.setLatLng(center);
    circle.addTo(map);

    $('#helper-text').html("<small>Drag the marker to move the circle, or <a onclick='removeCircle()'>remove it.</a></small>");
    $('#label-2').html("incidents");
}

var removeCircle = function() {
    circleVisible = false;
    toleranceSlider.slider('disable');
    map.removeLayer(centerMarker);
    map.removeLayer(circle);

    filterLocation();

    $('#helper-text').html("<small>Click the map to filter by region.</small>");
    $('#label-2').html("total incidents");
}

/*
 * Listeners for adding and changing location of circle
 */
map.on('click', function(e) {
    point = e.latlng;

    addCircle(point);
    filterLocation();

    centerMarker.setLatLng(point);
    centerMarker.addTo(map);

});
centerMarker
    .on('dragend', function(e) {
        circle.setLatLng(e.target._latlng);
        filterLocation();
    })
    .on('drag', function(e) {
        circle.setLatLng(e.target._latlng);;
    });

/*
 * Tolerance slider setup
 */
var toleranceSlider = $("#tolerance-slider").slider({
    formatter: function(value) {
        return value + ' meters';
    }
});

var updateTolerance = function(newTolerance) {
    tolerance = newTolerance;
    circle.setRadius(tolerance);
    filterLocation();
}

toleranceSlider.on("slideStop", function() {
    updateTolerance(toleranceSlider.val());
})

/*
 * Let's go!
 */
$.getJSON(dataUrl,handleJSON);
