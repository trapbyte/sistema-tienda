const express = require('express');
const enrutador = express.Router();
const compraControlador = require('../controladores/compraControlador');

// Ruta de factura detallada debe ir antes de rutas con :id
enrutador.get('/factura/:nro_fac', compraControlador.obtenerFacturaDetallada);

enrutador.post('/registrar', compraControlador.registrarCompra);
enrutador.get('/listar', compraControlador.listarCompras);
enrutador.put('/actualizar/:id', compraControlador.actualizarCompra);
enrutador.delete('/borrar/:id', compraControlador.borrarCompra);

module.exports = enrutador;
