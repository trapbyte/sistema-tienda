const express = require('express');
const enrutador = express.Router();
const cajeroControlador = require('../controladores/cajeroControlador');

enrutador.post('/registrar', cajeroControlador.registrarCajero);
enrutador.get('/listar', cajeroControlador.listarCajeros);
enrutador.put('/actualizar/:id', cajeroControlador.actualizarCajero);
enrutador.delete('/borrar/:id', cajeroControlador.eliminarCajero);

module.exports = enrutador;
