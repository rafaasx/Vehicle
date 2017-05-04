'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost', routes: { cors: true } });

var carList = [
    {id: 1, name: 'Corsa', license_plate: 'MCA-4620', brand_id: '1', model_id: '1'},
    {id: 2, name: 'Fiorino', license_plate: 'KYP7866', brand_id: '2', model_id: '2'},
    {id: 3, name: 'Peugeot 207', license_plate: 'MBN-2807', brand_id: '1', model_id: '1'},
    {id: 4, name: 'Peugeot 307', license_plate: 'ABC-1234', brand_id: '2', model_id: '2'},
    {id: 5, name: 'Veiron', license_plate: 'XYZ-1234', brand_id: '1', model_id: '2'}
];
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/vehicles',
    handler: function (request, reply) {
        reply(carList);
    }
});

server.route({
    method: 'GET',
    path: '/vehicles/{id}',
    handler: function (request, reply) {
        var car = carList.find(x => x.id == request.params.id);
        if (car != undefined)
            reply(car);
        else
            reply().code(404)
    }
});

server.route({
    method: 'POST',
    path: '/vehicles',
    handler: function (request, reply) {
        var car = request.payload;
        car.id = carList.length + 1;
        carList.push(car);
        reply(car);
    }
});

server.route({
    method: 'PUT',
    path: '/vehicles/{id}',
    handler: function (request, reply) {
        var index = carList.findIndex((car => car.id == request.params.id));
        var car = request.payload;
        carList[index] = car;
        reply(car);
    }
});

server.route({
    method: 'DELETE',
    path: '/vehicles/{id}',
    handler: function (request, reply) {
        var car = carList.find(x => x.id == request.params.id);
        carList = carList.filter(function(car) {return car.id != request.params.id;});
        reply(car);
    }
});



server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
