'use strict';

const Lti = require('lti');
let credentialDB = require('./../data');
let consumerCredential = credentialDB.consumer;
const _ = require('lodash');


const consumerService = {
  getData: function (callback) {
    let options = consumerCredential.getData;

    try {
      if (!options.url) {
        //Return error if endpoint is not configured
        return callback('Unable to access content')
      }

      let consumer = new Lti.ToolConsumer(options.url, options.consumerKey, options.consumerSecret);

      consumer
        .withSession(function (session) {
          let payload = {
            lti_version: 'LTI-1p0',
            lti_message_type: 'basic-lti-launch-request',
            resource_link_id: '0'
          };

          session
            .basicLaunch(payload)
            .then(function (reply) {
              let data;
              reply.map(function (mappedData) {
                data = JSON.parse(mappedData);
              });

              if (data.statusCode && data.statusCode !== 200) {
                callback(data.message);
              } else {
                callback(null, data);
              }
            })
            .catch(function (err) {
              callback(err);
            })
            .done()
        });
    } catch (ex) {
      callback(ex);
    }
  },

  setCredentials: function (data, callback) {
    consumerCredential[data.location] = {
      url: data.url,
      consumerKey: data.consumerKey,
      consumerSecret: data.consumerSecret
    };

    callback(null, {message: 'Credentials created'});
  }
};

module.exports = consumerService;
