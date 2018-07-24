import React, { Component } from 'react';
import '../App.css';
import scriptLoader from 'react-async-script-loader';
import Map from './Map';
import { MAP_API_KEY } from '../data/auth';
import { mapStyle } from '../data/mapStyle';
import { locations } from '../data/locations';
import Filter from './Filter';
import foursquareLogo from '../images/foursquare.png';
import { FS_CLIENT_ID } from '../data/auth';
import { FS_CLIENT_SECRET } from '../data/auth';
import markerDefault from '../images/marker-default.png';

let buildMap = {};
export let checkGetData = '';

class App extends Component {
  // React constructor
  constructor(props) {
    super(props);

    // Initial app states
    this.state = {
      infowindow: {},
      map: {},
      markers: [],
    }
    // Binding the getData function to this
    this.getData = this.getData.bind(this);
  }

  componentWillReceiveProps({isScriptLoadSucceed}) {
    // Conditional to initialize the map when the script loads
    if (isScriptLoadSucceed) {

      // Calls this function to fetch Foursquare data asynchronously
      this.getData();

      // Initialize Google Maps
      buildMap = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: 53.208003, lng: 50.1983114 },
        zoom: 12,
        styles: mapStyle,
        mapTypeControl: false,
        fullscreenControl: false
      });

      const bounds = new window.google.maps.LatLngBounds();
      const createInfoWindow = new window.google.maps.InfoWindow({maxWidth: 320});
      const myEvents = 'click keypress'.split(' ');
      let buildMarkers = [];
      let allLocations = [];

      setTimeout(() => {

        /**
        * Checks if the markers get Foursquare data from locations.js for all markers
        */
        if (this.state.markers.length === 12) {
          allLocations = this.state.markers;
          console.log(allLocations);

          checkGetData = true;

          } else {
          allLocations = locations;
          console.log(allLocations);
        }

        for (let i = 0; i < allLocations.length; i++) {
          let position = {lat: allLocations[i].location.lat, lng: allLocations[i].location.lng};
          let name = allLocations[i].name;
          let address = allLocations[i].location.address;
          let lat = allLocations[i].location.lat;
          let lng = allLocations[i].location.lng;
          let moreInfo = '';

          if (checkGetData === true) {
            moreInfo = allLocations[i].canonicalUrl;
          }

          let marker = new window.google.maps.Marker({
            id: i,
            map: buildMap,
            position: position,
            name: name,
            title: name,
            address: address,
            lat: lat,
            lng: lng,
            moreInfo: moreInfo,
            icon: markerDefault,
            animation: window.google.maps.Animation.DROP
          });

          buildMarkers.push(marker);

          // Adds event listeners to all created markers
          for (let i = 0; i < myEvents.length; i++) {
            marker.addListener(myEvents[i], function() {
              addInfoWindow(this, createInfoWindow);
              this.setAnimation(window.google.maps.Animation.BOUNCE);
              setTimeout(function () {
                marker.setAnimation(null);
              }, 1000);
            });
          }

          bounds.extend(buildMarkers[i].position);
        }

        buildMap.fitBounds(bounds);

        // Updates states with prepared data
        this.setState({
          map: buildMap,
          markers: buildMarkers,
          infowindow: createInfoWindow
        });
      }, 1200);
    // Indication when the map can't be loaded
    } else {
      alert('Could not coonect to Google Maps API');
    }
  }


  getData() {
    let places = [];
    locations.map((location) =>
      fetch(`https://api.foursquare.com/v2/venues/search?v=20161016&ll=` +
        `?client_id=${FS_CLIENT_ID}` +
        `&client_secret=${FS_CLIENT_SECRET}`)
        );

    // Updates the markers state with the data obtained
    this.setState({
      markers: places
    });
    console.log(this.state.markers);
  }

  // Renders the App
  render() {
    return (
      <div className='App' role='main'>
        <Filter
          map={ this.state.map }
          markers={ this.state.markers }
          infowindow={ this.state.infowindow }
        />
        <Map />
      </div>
    );
  }
}

/**
* @description Opens the infowindow
* @param {object} marker
* @param {object} infowindow
* @param {object} buildMap
*/

function addInfoWindow(marker, infowindow) {
    infowindow.setContent(
      '<div class="info-wrap">'+
      '<h2 class="info-name">'+marker.name+'</h2><br>'+
      '<p class="info-position">Latitude: '+marker.lat+'</p><br>'+
      '<p class="info-position">Longitude: '+marker.lng+'</p><br>'+
      '<p class="info-address">Address: '+marker.address+'</p><br>'+
      '<a class="info-link" href='+marker.moreInfo+' target="_blank"><span>For more information<span></a><br>'+
      '<img class="info-fslogo" src='+foursquareLogo+' alt="Powered by Foursquare"><br>'+
      '</div>'
    );
    infowindow.open(buildMap, marker);
  }



// Load the Google Maps API
export default scriptLoader(
  [`https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}`]
)(App);

