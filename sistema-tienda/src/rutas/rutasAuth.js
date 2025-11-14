const express = require('express');
const enrutador = express.Router();
const authControlador = require('../controladores/authControlador');

enrutador.post('/login', authControlador.login);
enrutador.post('/registrar', authControlador.registrarUsuario);
enrutador.get('/usuarios', authControlador.listarUsuarios);
enrutador.put('/usuarios/:id/estado', authControlador.cambiarEstadoUsuario);

module.exports = enrutador;
