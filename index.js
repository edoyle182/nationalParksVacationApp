'use strict';

const NATIONAL_PARKS_URL = 'https://developer.nps.gov/api/v1/';
const API_KEY = 'jesAgdfOyQGRD6GnNEuCVbkIRSr2h5W9GQikYrMJ';

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  return queryItems.join('&');
}

// Get National Parks List
function getNationalParksList(state, maxResults) {
  // setup query
  const params = {
    api_key: API_KEY,
    stateCode: state,
    limit: maxResults
    // q: "",
  };
  // put URL together
  const queryString = formatQueryParams(params);
  const url = `${NATIONAL_PARKS_URL}parks?${queryString}`;

  console.log(url);

  // fetch
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('.js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function getReverseGeocode(latlng, elementID) {
  const splitLatLong = latlng.split(', ');
  const googleLatLng = `latlng=${splitLatLong[0].substr(4)},${splitLatLong[1].substr(5)}`;
  const google_url = 'https://maps.googleapis.com/maps/api/geocode/json?';
  // const k1 = 'AIzaSyAymq9T2';
  // const k2 = 'YaHaY6eI6UCeNv';
  // const k3 = '9fDk51zVaVXk'; 
  const google_api = "&key=" + "AIzaSyAymq9T2YaHaY6eI6UCeNv9fDk51zVaVXk";       // k1 + k3 + k2;
  const completeURL = google_url + googleLatLng + google_api;
  console.log(completeURL);

  fetch(completeURL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      if (responseJson.results[0] !== undefined) {
        console.log(responseJson.results[0].formatted_address);
        $(`#${elementID}`).text(`Address: ${responseJson.results[0].formatted_address}`);
      }
    })
    .catch(err => {
      $(`#${elementID}`).text('Could not get address: ' + err);
    });
}

// Display Results
function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('.js-results-list').empty();

  for (let obj in responseJson.data) {
    // utilize google reverse geocode API to retrieve address from latitude/longitude coordinates
    let latlng = responseJson.data[obj].latLong;
    let elementID = `li${obj}`;
    
    if (latlng !== undefined && latlng !== "") {
      getReverseGeocode(latlng, elementID);
    }
    // for each object in array, add list item to results
    // list with full name, URL, description, and address (if applicable)
    $('.js-results-list').append(
      `<li><h3><a href="${responseJson.data[obj].url}">${responseJson.data[obj].fullName}</a></h3>
      <p id='${elementID}'>Address: Not Found</p>
      <p>Description: ${responseJson.data[obj].description}</p>
      </li>
      `
    );
  }
  // display results section
  $('.js-results').removeClass('hidden');
}

// Watch for event submit on button
// & send info to function
function watchForm() {
  $('.js-form').submit(e => {
    e.preventDefault();
    const state = $('.js-state').val();
    const maxResults = $('.js-max-results').val();

    getNationalParksList(state, maxResults);
  });
}

// jQuery watch form
$(watchForm);
