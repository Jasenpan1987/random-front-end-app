'use strict';

require('bootstrap/dist/css/bootstrap.min.css');
require('static/main.css');

require('bootstrap/dist/js/bootstrap.bundle.min');

const projectConfig = MARKETPLACE_PROJECT_CONFIG;

const $ = require('jquery');
const firebase = require('firebase/app');
require('firebase/auth');

// Initialize firebase before we finish loading
if (!firebase.apps.length) {
  firebase.initializeApp(projectConfig.firebase);
}

((window, document, $, firebase) => {
  $(document).ready(function() {
    // FIXME: it would be better to pass in these URLs as part of the build process
    const loginUrl = projectConfig.endpoints.login;

    firebase.auth().onIdTokenChanged(user => {
      if (user && !user.isAnonymous) {
        $('#user-nav-menu').css('visibility', 'visible');
        $('#headerSigninBtn')
          .attr('href', '')
          .text(user.displayName.split(' ')[0]);

        $('#headerSigninBtn')
          .siblings()
          .removeClass('d-none')
          .addClass('d-block');
        // $('#headerSigninBtn + i')
        //   .removeClass('d-none')
        //   .addClass('d-block');

        // $('#headerSigninBtn + a')
        //   .removeClass('d-none')
        //   .addClass('d-block');

        const accessToken = user._lat;

        $.ajax({
          url:
            projectConfig.endpoints.listings +
            '/api/customers/v1/tickets/summary',
          type: 'GET',
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
          },
          data: {},
          success: function(response) {
            const { tickets, listings, sold } = response.data;
            $('#ticketsSpan').html(tickets);
            $('#listingsSpan').html(listings);
            $('#soldSpan').html(sold);
          },
          error: function() {}
        });

        $('#sign-out-btn').click(() => {
          firebase.auth().signOut();
        });
      } else {
        $('#user-nav-menu').css('visibility', 'hidden');
        $('#headerSigninBtn').html('Sign In/Sign Up');
        $('#headerSigninBtn').attr('href', loginUrl);
      }
    });

    // enable keyword search
    $('#searchBar').keypress(e => {
      const code = e.keyCode || e.which;
      if (code === 13) {
        e.preventDefault();
        const searchKeyword = $('#searchBar').val();
        if (searchKeyword) {
          const uri =
            projectConfig.endpoints.purchase +
            '/searchlist?keyword=' +
            encodeURIComponent(searchKeyword);
          window.location = uri;
        }
      }
    });

    $('div.feature-item.card').click(function() {
      event.preventDefault();
      const event_name = $(this)
        .children('img')
        .attr('alt');
      if (event_name) {
        const uri =
          projectConfig.endpoints.purchase +
          '/searchlist?keyword=' +
          encodeURIComponent(event_name);
        window.location = uri;
      }
    });
  });
})(window, document, $, firebase);
