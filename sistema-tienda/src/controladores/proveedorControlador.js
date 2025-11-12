const { Proveedor } = require('../baseDatos');

const registrarProveedor = async (req, res) => {
  try {
    const { nit_prov, nom_prov, dir_prov, tel_prov } = req.body;
    if (!nit_prov || !nom_prov) {
      return res.status(400).json({ mensaje: "NIT y nombre son obligatorios", resultado: null });
    }
    const proveedorExistente = await Proveedor.findByPk(nit_prov);
    if (proveedorExistente) {
      return res.status(400).json({ mensaje: "Ya existe un proveedor con este NIT", resultado: null });
    }
    const nuevoProveedor = await Proveedor.create({ nit_prov, nom_prov, dir_prov, tel_prov });
    res.status(201).json({ mensaje: "Proveedor registrado", resultado: nuevoProveedor });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.status(200).json({ mensaje: "Lista de proveedores", resultado: proveedores });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_prov, dir_prov, tel_prov } = req.body;
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado", resultado: null });
    }
    await proveedor.update({ nom_prov, dir_prov, tel_prov });
    res.status(200).json({ mensaje: "Proveedor actualizado", resultado: proveedor });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado", resultado: null });
    }
    await proveedor.destroy();
    res.status(200).json({ mensaje: "Proveedor eliminado", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarProveedor,
  listarProveedores,
  actualizarProveedor,
  eliminarProveedor
};
