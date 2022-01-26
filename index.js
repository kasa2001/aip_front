'use strict';

const Hapi = require('hapi');
const Vision = require('vision');
const pug = require('pug');
const Inert = require('inert');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/index',
    options: {
        handler: (req, h) => {
            return h.view('index', {
                title: 'Custom Title',
                message: 'Custom message'
            });
        }
    }
});

const init = async () => {
    await server.register([Inert, Vision]);
    server.views({
        engines: {
            html: pug
        },
        relativeTo: __dirname,
        path: 'templates'
    });
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();