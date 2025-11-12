const { Cajero } = require('../baseDatos');

const registrarCajero = async (req, res) => {
  try {
    const { ide_caj, nom_caj, tel_caj, dir_caj } = req.body;
    if (!ide_caj || !nom_caj) {
      return res.status(400).json({ mensaje: "ID y nombre son obligatorios", resultado: null });
    }
    const cajeroExistente = await Cajero.findByPk(ide_caj);
    if (cajeroExistente) {
      return res.status(400).json({ mensaje: "Ya existe un cajero con este ID", resultado: null });
    }
    const nuevoCajero = await Cajero.create({ ide_caj, nom_caj, tel_caj, dir_caj });
    res.status(201).json({ mensaje: "Cajero registrado", resultado: nuevoCajero });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarCajeros = async (req, res) => {
  try {
    const cajeros = await Cajero.findAll();
    res.status(200).json({ mensaje: "Lista de cajeros", resultado: cajeros });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const actualizarCajero = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_caj, tel_caj, dir_caj } = req.body;
    const cajero = await Cajero.findByPk(id);
    if (!cajero) {
      return res.status(404).json({ mensaje: "Cajero no encontrado", resultado: null });
    }
    await cajero.update({ nom_caj, tel_caj, dir_caj });
    res.status(200).json({ mensaje: "Cajero actualizado", resultado: cajero });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const eliminarCajero = async (req, res) => {
  try {
    const { id } = req.params;
    const cajero = await Cajero.findByPk(id);
    if (!cajero) {
      return res.status(404).json({ mensaje: "Cajero no encontrado", resultado: null });
    }
    await cajero.destroy();
    res.status(200).json({ mensaje: "Cajero eliminado", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarCajero,
  listarCajeros,
  actualizarCajero,
  eliminarCajero
};
