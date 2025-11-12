const express = require('express');
const enrutador = express.Router();
const puntosClienteControlador = require('../controladores/puntosClienteControlador');

enrutador.get('/consultar/:ide_cli', puntosClienteControlador.consultarPuntosCliente);

module.exports = enrutador;
