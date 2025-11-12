const { Categoria } = require('../baseDatos');

const registrarCategoria = async (req, res) => {
  try {
    const { cod_cat, nom_cat } = req.body;
    if (!cod_cat || !nom_cat) {
      return res.status(400).json({ mensaje: "Código y nombre son obligatorios", resultado: null });
    }
    const categoriaExistente = await Categoria.findByPk(cod_cat);
    if (categoriaExistente) {
      return res.status(400).json({ mensaje: "Ya existe una categoría con este código", resultado: null });
    }
    const nuevaCategoria = await Categoria.create({ cod_cat, nom_cat });
    res.status(201).json({ mensaje: "Categoría registrada", resultado: nuevaCategoria });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll();
    res.status(200).json({ mensaje: "Lista de categorías", resultado: categorias });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom_cat } = req.body;
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada", resultado: null });
    }
    await categoria.update({ nom_cat });
    res.status(200).json({ mensaje: "Categoría actualizada", resultado: categoria });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada", resultado: null });
    }
    await categoria.destroy();
    res.status(200).json({ mensaje: "Categoría eliminada", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarCategoria,
  listarCategorias,
  actualizarCategoria,
  eliminarCategoria
};
