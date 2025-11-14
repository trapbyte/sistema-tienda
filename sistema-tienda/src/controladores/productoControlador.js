const { Producto } = require("../baseDatos");

const registrarProducto = async (req, res) => {
  try {
    const { cod_pro, nom_pro, descripcion, cant_pro, val_pro, fec_ven_pro, cod_cat } = req.body;
    if (!cod_pro || !nom_pro || !val_pro) {
      return res.status(400).json({ mensaje: "Código, nombre y valor son obligatorios", resultado: null });
    }
    const productoExistente = await Producto.findByPk(cod_pro);
    if (productoExistente) {
      return res.status(400).json({ mensaje: "Ya existe un producto con este código", resultado: null });
    }
    const nuevoProducto = await Producto.create({ cod_pro, nom_pro, descripcion, cant_pro, val_pro, fec_ven_pro, cod_cat });
    res.status(201).json({ mensaje: "Producto registrado", resultado: nuevoProducto });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.status(200).json({ mensaje: "Lista de productos", resultado: productos });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_pro, descripcion, cant_pro, val_pro, fec_ven_pro, cod_cat } = req.body;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado", resultado: null });
    }
    await producto.update({ nom_pro, descripcion, cant_pro, val_pro, fec_ven_pro, cod_cat });
    res.status(200).json({ mensaje: "Producto actualizado", resultado: producto });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado", resultado: null });
    }
    await producto.destroy();
    res.status(200).json({ mensaje: "Producto eliminado", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarProducto,
  listarProductos,
  actualizarProducto,
  borrarProducto,
};
