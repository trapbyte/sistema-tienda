const express = require('express');
const enrutador = express.Router();
const productoControlador = require('../controladores/productoControlador');

enrutador.post('/registrar', productoControlador.registrarProducto);
enrutador.get('/listar', productoControlador.listarProductos);
enrutador.put('/actualizar/:id', productoControlador.actualizarProducto);
enrutador.delete('/borrar/:id', productoControlador.borrarProducto);

module.exports = enrutador;
