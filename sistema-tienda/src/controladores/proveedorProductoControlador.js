const { ProveedorProducto } = require("../baseDatos");

const registrarRelacion = async (req, res) => {
  try {
    const { nit_prov, cod_pro } = req.body;
    if (!nit_prov || !cod_pro) {
      return res.status(400).json({ mensaje: "NIT y código de producto son obligatorios", resultado: null });
    }
    const existente = await ProveedorProducto.findOne({ where: { nit_prov, cod_pro } });
    if (existente) {
      return res.status(400).json({ mensaje: "Ya existe esta relación", resultado: null });
    }
    const nuevaRelacion = await ProveedorProducto.create({ nit_prov, cod_pro });
    res.status(201).json({ mensaje: "Relación registrada", resultado: nuevaRelacion });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarRelaciones = async (req, res) => {
  try {
    const relaciones = await ProveedorProducto.findAll();
    res.status(200).json({ mensaje: "Lista de relaciones proveedor-producto", resultado: relaciones });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const eliminarRelacion = async (req, res) => {
  try {
    const { nit_prov, cod_pro } = req.params;
    const relacion = await ProveedorProducto.findOne({ where: { nit_prov, cod_pro } });
    if (!relacion) {
      return res.status(404).json({ mensaje: "Relación no encontrada", resultado: null });
    }
    await relacion.destroy();
    res.status(200).json({ mensaje: "Relación eliminada", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarRelacion,
  listarRelaciones,
  eliminarRelacion,
};
