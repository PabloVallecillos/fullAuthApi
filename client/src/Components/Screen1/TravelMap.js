import React, { useState, useRef, useCallback } from "react";
import MapGL, { Marker, Popup } from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

function TravelMap() {

    const [viewport, setViewport] = useState({
        latitude: 40.416775,
        longitude: -3.703790,
        zoom: 6,
    });

    const mapRef = useRef();
    const handleViewportChange = useCallback(
        (newViewport) => setViewport(newViewport),
        []
    );

    const handleGeocoderViewportChange = useCallback(
        (newViewport) => {
        const geocoderDefaultOverrides = { transitionDuration: 1000 };

        return handleViewportChange({
            ...newViewport,
            ...geocoderDefaultOverrides
        });
        },
        [handleViewportChange]
    );

    return (
        <div className="travelMap">
            <div className="map">
                <MapGL
                    {...viewport}
                    ref={mapRef}
                    width="100%"
                    height="100%"
                    mapStyle="mapbox://styles/vallecillos/cke4b0n8d102s19o6zzf0e6iq"
                    mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                    onViewportChange={nextViewport => setViewport(nextViewport)}
                    preventStyleDiffing={false}
                >
                    <Geocoder
                        mapRef={mapRef}
                        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                        onViewportChange={handleGeocoderViewportChange}
                        position="top-left"
                    />
                </MapGL>
            </div>
        </div>
    )
}

export default TravelMap
