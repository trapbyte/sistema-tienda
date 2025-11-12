const { Cliente } = require("../baseDatos");

const registrarCliente = async (req, res) => {
  try {
    const { ide_cli, nom_cli, dir_cli, tel_cli } = req.body;
    if (!ide_cli || !nom_cli) {
      return res
        .status(400)
        .json({ mensaje: "Cédula e nombre son obligatorios", resultado: null });
    }
    const clienteExistente = await Cliente.findByPk(ide_cli);
    if (clienteExistente) {
      return res
        .status(400)
        .json({
          mensaje: "Ya existe un cliente con esta cédula",
          resultado: null,
        });
    }
    const nuevoCliente = await Cliente.create({
      ide_cli,
      nom_cli,
      dir_cli,
      tel_cli,
    });
    res
      .status(201)
      .json({ mensaje: "Cliente creado", resultado: nuevoCliente });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.status(200).json({ mensaje: "Lista de Clientes", resultado: clientes });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const { cedula } = req.params;
    const { nom_cli, dir_cli, tel_cli } = req.body;
    const cliente = await Cliente.findByPk(cedula);
    if (!cliente) {
      return res
        .status(404)
        .json({ mensaje: "Cliente no encontrado", resultado: null });
    }
    await cliente.update({ nom_cli, dir_cli, tel_cli });
    res
      .status(200)
      .json({ mensaje: "Cliente actualizado", resultado: cliente });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const eliminarCliente = async (req, res) => {
  try {
    const { cedula } = req.params;
    const cliente = await Cliente.findByPk(cedula);
    if (!cliente) {
      return res
        .status(404)
        .json({ mensaje: "Cliente no encontrado", resultado: null });
    }
    await cliente.destroy();
    res.status(200).json({ mensaje: "Cliente eliminado", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarCliente,
  listarClientes,
  actualizarCliente,
  eliminarCliente,
};
