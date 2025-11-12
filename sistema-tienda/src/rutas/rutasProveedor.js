const express = require('express');
const enrutador = express.Router();
const proveedorControlador = require('../controladores/proveedorControlador');

enrutador.post('/registrar', proveedorControlador.registrarProveedor);
enrutador.get('/listar', proveedorControlador.listarProveedores);
enrutador.put('/actualizar/:id', proveedorControlador.actualizarProveedor);
enrutador.delete('/borrar/:id', proveedorControlador.eliminarProveedor);

module.exports = enrutador;
