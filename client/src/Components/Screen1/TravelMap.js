import React, { useState, useRef, useEffect, useCallback } from "react";
import MapGL, { Marker, Popup } from 'react-map-gl';
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { listLogEntries } from '../../Api/api';
import marker from '../../assets/marker.svg';
import legend from '../../assets/legend.svg';
import '../../assets/style.css';
import LogEntryForm from './LogEntryForm';
import { CSSTransition } from 'react-transition-group';

function TravelMap() {
    const [logEntries, setLogEntries] = useState([]);
    const [show, setShow] = useState(false);
    const [showPopup, setShowPopup] = useState({});
    const [addEntryLocation, setAddEntryLocation] = useState(null);
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

    const getEntries = async () => {
        const logEntries = await listLogEntries();
        setLogEntries(logEntries)
    }

    useEffect(() => {
        getEntries()
    }, []);

    const showAddMarkerPopup = (e) => {
        const [longitude, latitude] = e.lngLat;
        setAddEntryLocation({
            latitude,
            longitude,
        });
    };

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
                    onDblClick={showAddMarkerPopup}
                >
                    <Geocoder
                        mapRef={mapRef}
                        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                        onViewportChange={handleGeocoderViewportChange}
                        position="top-left"
                    />
                    <div
                        className="absolute top-0 right-0 bg-white p-0 customLegendIcon flex flex-column rounded-sm hover"
                        onMouseEnter={() => setShow(true)}
                    >
                        <img src={legend}></img>
                    </div>
                    {/* https://medium.com/@robbertvancaem/using-react-spring-for-a-simple-hover-state-2a75beef6930 */}
                    {show && (
                        <div
                            className="absolute top-0 right-0 bg-white p-1 mr-2 mt-2 customLegend hoverInfo flex flex-column rounded-sm"
                            onMouseLeave={() => (setShow(false))}
                        >
                            <h5 className="align-self-center m-0 p-0 mt-1 mb-2">Legend</h5>
                            <hr className="m-0"></hr>
                            <div className="mt-2 mb-2">
                                {logEntries.map((entry) => (
                                    <React.Fragment key={entry._id}>
                                        <p className="m-0 p-0 flex"> <img className="mr-2 ml-2" src={marker} width="20"></img> {entry.title}</p>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}
                    {logEntries.map((entry) => (
                        <React.Fragment key={entry._id}>
                            <Marker
                                key={entry._id}
                                latitude={entry.latitude}
                                longitude={entry.longitude}
                                offsetLeft={-20}
                                offsetTop={-10}
                            >
                                <div
                                    onClick={() =>
                                        setShowPopup({
                                            [entry._id]: true,
                                        })
                                    }
                                    className="hover"
                                >
                                    <img
                                        className="marker"
                                        style={{
                                            height: `${6 * viewport.zoom}px`,
                                            width: `${6 * viewport.zoom}px`,
                                        }}
                                        src={marker}
                                        alt="marker"
                                    ></img>
                                    {entry.title}
                                </div>
                            </Marker>
                            {showPopup[entry._id] && (
                                <Popup
                                    latitude={entry.latitude}
                                    longitude={entry.longitude}
                                    closeButton={true}
                                    closeOnClick={false}
                                    dynamicPosition={true}
                                    anchor="left"
                                    onClose={() => setShowPopup({})}
                                >
                                    <div
                                        className="popup"
                                    >
                                        <h3>{entry.title}</h3>
                                        <p>{entry.comments}</p>
                                        <small>
                                        Visited on: {new Date(entry.visitDate).toLocaleDateString()}
                                        </small>
                                    </div>
                                </Popup>
                            )}
                        </React.Fragment>
                    ))}
                    {addEntryLocation ? (
                        <>
                        <Marker
                            latitude={addEntryLocation.latitude}
                            longitude={addEntryLocation.longitude}
                        >
                            <div>
                            <img
                                className="markerAdd"
                                style={{
                                height: `${6 * viewport.zoom}px`,
                                width: `${6 * viewport.zoom}px`,
                                }}
                                src="https://image.flaticon.com/icons/svg/561/561237.svg"
                                alt="marker"
                            />
                            </div>
                        </Marker>
                        <Popup
                            latitude={addEntryLocation.latitude}
                            longitude={addEntryLocation.longitude}
                            closeButton={true}
                            closeOnClick={false}
                            dynamicPosition={true}
                            onClose={() => setAddEntryLocation(null)}
                            anchor="top"
                        >
                            <div className="popup">
                            <LogEntryForm
                                onClose={() => {
                                    setAddEntryLocation(null);
                                    getEntries();
                                }}
                                location={addEntryLocation}
                            />
                            </div>
                        </Popup>
                        </>
                    ) : null}
                </MapGL>
            </div>
        </div>
    )
}

export default TravelMap
