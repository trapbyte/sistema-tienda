const express = require('express');
const enrutador = express.Router();
const authControlador = require('../controladores/authControlador');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../baseDatos');

// Manejo explícito de OPTIONS para CORS preflight en /login
enrutador.options('/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*'); // Solo para pruebas, ajusta en producción
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

enrutador.post('/login', authControlador.login);
enrutador.post('/registrar', authControlador.registrarUsuario);
enrutador.get('/usuarios', authControlador.listarUsuarios);
enrutador.put('/usuarios/:id/estado', authControlador.cambiarEstadoUsuario);

module.exports = enrutador;
