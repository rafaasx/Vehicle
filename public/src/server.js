'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost', routes: { cors: true } });
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '172202',
    database : 'vehicle'
});
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

server.route({
    method: 'GET',
    path: '/vehicles',
    handler: function (request, reply) {
        connection.query('SELECT * FROM vehicle', function(err, results, fields) {
            if (!err)
            reply(results);
            else
            reply('Error while performing Query.');
        });
    },
    config: {
        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(100).default(10)
            }
        }
    }
});

server.route({
    method: 'GET',
    path: '/vehicles/{id}',
    handler: function (request, reply) {
        connection.query('SELECT * FROM vehicle WHERE id = ?', request.params.id, function(err, results, fields) {
            if (!err)
            {
                reply(results[0]).code(results.length > 0 ? 200 : 404 );
            }
            else
            reply('Error while performing Query.');
        });
    },
    config: {
        validate: {
            params: {
                id: Joi.number()
            }
        }
    }
});

server.route({
    method: 'POST',
    path: '/vehicles',
    handler: function (request, reply) {
        var query = connection.query('SELECT * FROM vehicle WHERE license_plate = ?', request.payload.license_plate, function(err, results, fields) {
            console.log('1');
            if (!err)
            {
                console.log('2');
                if (results.length == 0) {
                    connection.query('INSERT INTO vehicle SET ?', request.payload, function (error, results, fields) {
                        console.log('3');
                        if (error) throw error;
                        else reply({ id: results.insertId }).code(201);
                    });
                }
                else {
                    console.log('5');
                    reply('The license plate ' + request.payload.license_plate + ' already exists.').code(409);
                }
            }
            console.log('6' + query.sql);
        });
    },
    config: {
        validate: {
            payload: {
                name: Joi.string().required(),
                license_plate: Joi.string().length(8).required(),
                brand_id: Joi.number(),
                model_id: Joi.number()
            }
        }
    }
});

server.route({
    method: 'PUT',
    path: '/vehicles/{id}',
    handler: function (request, reply) {
        connection.query('SELECT * FROM vehicle WHERE id = ?', request.params.id, function(err, results, fields) {
            if (!err)
            {
                if (results.length > 0) {
                    connection.query('UPDATE vehicle SET ? WHERE id = ?', [request.payload, request.params.id], function (error, results, fields) {
                        if (error) throw error;
                        else reply({ changedRows :  results.changedRows }).code(200);
                    });
                }
                else {
                    reply().code(404);
                }
            }
            else
            {
                reply('Error while performing Query.');
            }
        });

    },
    config: {
        validate: {
            payload: {
                id: Joi.number().required(),
                name: Joi.string().required(),
                license_plate: Joi.string().length(8).required(),
                brand_id: Joi.number(),
                model_id: Joi.number()
            }
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/vehicles/{id}',
    handler: function (request, reply) {
        connection.query('SELECT * FROM vehicle WHERE id = ?',  request.params.id, function(err, results, fields) {
            if (!err)
            {
                if (results.length > 0) {
                    connection.query('DELETE FROM vehicle WHERE id = ?', request.params.id, function (error, results, fields) {
                        if (error) throw error;
                        else reply({ 'affectedRows' :  results.affectedRows });
                    });
                }
                else {
                    reply().code(404);
                }
            }
        });
    },
    config: {
        validate: {
            params: {
                id: Joi.number()
            }
        }
    }
});



server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
