const express = require('express');
const enrutador = express.Router();
const puntosClienteControlador = require('../controladores/puntosClienteControlador');

enrutador.get('/listar', puntosClienteControlador.listarPuntosClientes);
enrutador.get('/cliente/:ide_cli', puntosClienteControlador.obtenerPuntosCliente);
enrutador.get('/detalle', puntosClienteControlador.listarDetallePuntos);
enrutador.post('/canjear', puntosClienteControlador.canjearPuntos);

module.exports = enrutador;
