'use strict';

const Hapi = require('hapi'),
  Inert = require('inert'),
  Vision = require('vision'),
  HapiSwagger = require('hapi-swagger');
const boom = require('boom');
const joi = require('joi');

const providerService = require('./lib/provider');


const server_settings = {
  address: "0.0.0.0",
  port: "8911",
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
  method: 'POST',
  path: '/getData',
  config: {
    handler: function (request, reply) {
      providerService.getData(request, function (err, data) {
        if (err) {
          reply(boom.unauthorized(err));
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
        consumerKey: request.payload.consumerKey,
        consumerSecret: request.payload.consumerSecret
      };

      providerService.setCredentials(options, function (err, data) {
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
    register: HapiSwagger,
    options: {
      info: {
        title: "LTI Provider",
        version: '0.0.1'
      }
    }
  }], function (err) {
  if (err) {
    console.log(err);
  }
});

server.start(function () {
  console.log('Server running at:', server.info.port);
});

