const express = require('express');
const enrutador = express.Router();
const compraControlador = require('../controladores/compraControlador');

enrutador.post('/registrar', compraControlador.registrarCompra);
enrutador.get('/listar', compraControlador.listarCompras);
enrutador.put('/actualizar/:id', compraControlador.actualizarCompra);
enrutador.delete('/borrar/:id', compraControlador.borrarCompra);

module.exports = enrutador;
