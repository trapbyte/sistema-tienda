const express = require('express');
const enrutador = express.Router();
const compraControlador = require('../controladores/compraControlador');

// Verifica que estas funciones existen en compraControlador
enrutador.get('/listar', compraControlador.listarCompras);
enrutador.post('/registrar', compraControlador.registrarCompra);
enrutador.get('/:id', compraControlador.obtenerCompraPorId);
enrutador.put('/actualizar/:id', compraControlador.actualizarCompra);
enrutador.delete('/borrar/:id', compraControlador.eliminarCompra);

module.exports = enrutador;
