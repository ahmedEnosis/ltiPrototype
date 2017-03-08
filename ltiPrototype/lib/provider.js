'use strict';

const imsLti = require('ims-lti');
let credentialDB = require('./../data');
let providerCredential = credentialDB.provider;
const _ = require('lodash');


const providerService = {
  getData: function (request, callback) {
    let consumerKey = _.get(request, 'payload.oauth_consumer_key');
    try {
      let provider = new imsLti.Provider(consumerKey, providerCredential[consumerKey]);

      provider.valid_request(request, function (err, isValid) {
        if (err) {
          callback(err);
        } else {
          if (isValid) {
            callback(null, {
              source: 'Provider',
              data: 'Test data'
            });
          } else {
            callback('Invalid request');
          }
        }
      });
    } catch (ex) {
      callback(ex);
    }
  },

  setCredentials: function (data, callback) {
    providerCredential[data.consumerKey] = data.consumerSecret;

    callback(null, {message: 'Credentials created'});
  }
};

module.exports = providerService;

