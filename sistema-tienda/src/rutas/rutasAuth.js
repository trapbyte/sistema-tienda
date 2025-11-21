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

enrutador.post('/crear-usuarios-iniciales', async (req, res) => {
  try {
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashCajero = await bcrypt.hash('cajero123', 10);

    await Usuario.findOrCreate({
      where: { email: 'admin@tienda.com' },
      defaults: {
        email: 'admin@tienda.com',
        password: hashAdmin,
        nombre: 'Administrador',
        rol: 'admin',
        activo: true
      }
    });

    await Usuario.findOrCreate({
      where: { email: 'cajero@tienda.com' },
      defaults: {
        email: 'cajero@tienda.com',
        password: hashCajero,
        nombre: 'Cajero',
        rol: 'cajero',
        activo: true
      }
    });

    res.json({ resultado: true, mensaje: 'Usuarios iniciales creados' });
  } catch (err) {
    res.status(500).json({ resultado: false, mensaje: 'Error al crear usuarios', error: err.message });
  }
});

module.exports = enrutador;
