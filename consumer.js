'use strict';

const Hapi = require('hapi'),
  Inert = require('inert'),
  Vision = require('vision'),
  HapiSwagger = require('hapi-swagger');
const boom = require('boom');
const joi = require('joi');

const consumerService = require('./lib/consumer');

const server_settings = {
  address: "0.0.0.0",
  port: "8912",
  routes: {
    cors: {
      exposedHeaders: ["accept", "content-type", "apikey"],
      headers: ["accept", "content-type", "apikey"]
    }
  }
};

let server = new Hapi.Server();


server.connection(server_settings);

server.route([{
  method: 'GET',
  path: '/getData',
  config: {
    handler: function (request, reply) {
      consumerService.getData(function (err, data) {
        if (err) {
          reply(boom.badRequest(err));
        } else {
          reply(data);
        }
      })

    },
    tags: ['api']
  }
}, {
  method: 'POST',
  path: '/setCredentials',
  config: {
    handler: function (request, reply) {
      let options = {
        location: request.payload.location,
        url: request.payload.url,
        consumerKey: request.payload.consumerKey,
        consumerSecret: request.payload.consumerSecret
      };

      consumerService.setCredentials(options, function (err, data) {
        if (err) {
          reply(boom.badRequest(err));
        } else {
          reply(data);
        }
      })
    },
    description: 'Set credential from provider',
    tags: ['api'],
    validate: {
      payload: {
        location: joi
          .string()
          .required()
          .description('Location to store the data'),
        url: joi
          .string()
          .required()
          .description('Url to get data from'),
        consumerKey: joi
          .string()
          .required()
          .description('Consumer key'),
        consumerSecret: joi
          .string()
          .required()
          .description('Consumer secret'),
      }
    }
  }
}]);

server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger
  }], function (err) {
  if (err) {
    console.log(err);
  }
});

server.start(function () {
  console.log('Server running at:', server.info.port);
});


