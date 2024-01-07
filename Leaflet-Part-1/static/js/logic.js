console.log("working")
//base street map layers
var myMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

var myMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// base layer
var map = L.map("map", {
    center: [38.50, -96.00],
    zoom: 3,
    layers:[topo,myMap]
});
myMap.addTo(map)
// console.log()
var baseMaps ={
    "Basic Map": myMap,
    Topography: topo
};

// add tectonic plate layer
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();
var overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
};

// retrieve & insert geoJSON data (all earthquakes in past day)
L.control
        .layers(baseMaps, overlays)
        .addTo(map);
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(function (data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true
            weight: 0.5
        };
    }

console.log(earthquakes);

// format colors for depth
    function getColor(depth) {
        switch (true){
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
        }
// GeoJSON layer
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
    style: styleInfo,
//add in pop-up info
    onEachFeature: function (feature, layer) {
        layer.bindPopup(
            "Magnitude: "
            +feature.properties.mag
            +"<br>Depth: "
            +feature.geometry.coordinates[2]
            +"<br>Location: "
            +feature.properties.place
        );
    }
}).addTo(earthquakes);
earthquakes.addTo(map);
// legend formatting
    var legend =L.control({
        position: "bottomright"
    });
    legend.onAdd= function(){
        var div = L.DomUtil.create("div", "info legend");
        var magnitudes = [-10, 10, 30, 50, 70, 90];
        var colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"];
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML += "<i style='background: "
                +colors[i]
                +" '></i>"
                +magnitudes[i]
                +(magnitudes[i+1] ? "&ndash;" +magnitudes[i+1]+ "<br>" : "+");
        }
        return div;
    };
    legend.addTo(map);
// retrieve tectonic plate JSON data
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
        L.geoJson(platedata, {
            color: "orange",
            weight: 2
        }).addTo(tectonicplates);
        tectonicplates.addTo(map);
    });
});