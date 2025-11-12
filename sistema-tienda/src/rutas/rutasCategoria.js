const express = require('express');
const enrutador = express.Router();
const categoriaControlador = require('../controladores/categoriaControlador');

enrutador.post('/registrar', categoriaControlador.registrarCategoria);
enrutador.get('/listar', categoriaControlador.listarCategorias);
enrutador.put('/actualizar/:id', categoriaControlador.actualizarCategoria);
enrutador.delete('/borrar/:id', categoriaControlador.eliminarCategoria);

module.exports = enrutador;
