const { Usuario } = require('../baseDatos');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        mensaje: "Email y contraseña son obligatorios", 
        resultado: null 
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      return res.status(401).json({ 
        mensaje: "Credenciales incorrectas", 
        resultado: null 
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ 
        mensaje: "Usuario inactivo", 
        resultado: null 
      });
    }

    // Comparar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ 
        mensaje: "Credenciales incorrectas", 
        resultado: null 
      });
    }

    // Login exitoso
    res.status(200).json({ 
      mensaje: "Login exitoso", 
      resultado: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message, resultado: null });
  }
};

const registrarUsuario = async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;
    
    if (!email || !password || !nombre) {
      return res.status(400).json({ 
        mensaje: "Email, contraseña y nombre son obligatorios", 
        resultado: null 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ 
        mensaje: "El email ya está registrado", 
        resultado: null 
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      email,
      password: passwordHash,
      nombre,
      rol: rol || 'cajero'
    });

    res.status(201).json({ 
      mensaje: "Usuario registrado correctamente", 
      resultado: {
        id_usuario: nuevoUsuario.id_usuario,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'email', 'nombre', 'rol', 'activo', 'createdAt']
    });
    res.status(200).json({ mensaje: "Lista de usuarios", resultado: usuarios });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado", resultado: null });
    }

    await usuario.update({ activo });
    res.status(200).json({ 
      mensaje: "Estado actualizado", 
      resultado: { id_usuario: usuario.id_usuario, activo: usuario.activo }
    });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  login,
  registrarUsuario,
  listarUsuarios,
  cambiarEstadoUsuario
};
