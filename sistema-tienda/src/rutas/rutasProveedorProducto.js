const express = require('express');
const enrutador = express.Router();
const proveedorProductoControlador = require('../controladores/proveedorProductoControlador');

enrutador.post('/registrar', proveedorProductoControlador.registrarRelacion);
enrutador.get('/listar', proveedorProductoControlador.listarRelaciones);
enrutador.delete('/borrar/:nit_prov/:cod_pro', proveedorProductoControlador.eliminarRelacion);

module.exports = enrutador;
