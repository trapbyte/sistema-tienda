const express = require('express');
const enrutador = express.Router();
const detalleCompraControlador = require('../controladores/detalleCompraControlador');

enrutador.post('/registrar', detalleCompraControlador.registrarDetalleCompra);
enrutador.get('/listar', detalleCompraControlador.listarDetallesCompra);
enrutador.put('/actualizar/:id', detalleCompraControlador.actualizarDetalleCompra);
enrutador.delete('/borrar/:id', detalleCompraControlador.eliminarDetalleCompra);

module.exports = enrutador;
