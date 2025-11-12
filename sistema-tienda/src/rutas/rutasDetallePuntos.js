const express = require('express');
const enrutador = express.Router();
const detallePuntosControlador = require('../controladores/detallePuntosControlador');

enrutador.get('/listar/:ide_cli', detallePuntosControlador.listarDetallePuntosPorCliente);

module.exports = enrutador;
