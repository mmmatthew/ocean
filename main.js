/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [37.9258, -121.9543, 12]; // NYC

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

    if (url_hash.length == 3) {
        map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }

    /*** Map ***/

    var map = L.map('map',
        {'keyboardZoomOffset': .05}
    );


    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        preUpdate: preUpdate,
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    map.setView(map_start_location.slice(0, 2), map_start_location[2]);

    var hash = new L.Hash(map);
    
    // Resize map to window
    function resizeMap() {
        document.getElementById('map').style.width = window.innerWidth + 'px';
        document.getElementById('map').style.height = window.innerHeight + 'px';
        map.invalidateSize(false);
    }

    window.addEventListener('resize', resizeMap);
    resizeMap();

    function controllerByName(which) {
        for (var i = 0; i < gui.__controllers.length; i++) {
            if (gui.__controllers[i].property == which) {
                return gui.__controllers[i];
            }
        }
    }

    // GUI options for rendering modes/effects
    var controls = {
        'water_level': 0
    };
    var directional_mouse = false;
    var point_mouse = false;
    var demo_mode = false;

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function rgbToHex(c) {
        var r = c[0] * 255;
        var g = c[1] * 255;
        var b = c[2] * 255;
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
            1
        ] : null;
    }

    // Create dat GUI
    var gui = new dat.GUI({ autoPlace: true, width: 300 });
    function addGUI () {
        gui.domElement.parentNode.style.zIndex = 500;
        window.gui = gui;

       
        gui.add(controls, 'water_level', -5.0, 20.0).name("sea level").onChange(function(value) {
            scene.styles.water.shaders.uniforms.water_level = value;
        });


        // reset these to defeat dat.gui's auto-precision setting
        controls.water_level = .1;
        // Iterate over all controllers
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }

        if (window.location.search == "?demo") {
    gui.__controllers[14].setValue(true);
}

    }



    /***** Render loop *****/
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
        });
        layer.addTo(map);
    });

    function preUpdate(will_render) {
        if (!will_render) {
            return;
        }
    }

    return map;

}());
