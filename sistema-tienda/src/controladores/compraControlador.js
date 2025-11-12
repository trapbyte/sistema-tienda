const { Factura, Cliente } = require("../baseDatos");

const registrarCompra = async (req, res) => {
  try {
    const { nro_fac, val_tot_fac, fec_fac, ide_cli, ide_caj } = req.body;
    const cliente = await Cliente.findByPk(ide_cli);
    if (!cliente) {
      return res
        .status(404)
        .json({ mensaje: "Cliente no encontrado", resultado: null });
    }
    const nuevaFactura = await Factura.create({
      nro_fac,
      val_tot_fac,
      fec_fac,
      ide_cli,
      ide_caj,
    });
    res
      .status(201)
      .json({ mensaje: "Factura registrada", resultado: nuevaFactura });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarCompras = async (req, res) => {
  try {
    const facturas = await Factura.findAll();
    res.status(200).json({ mensaje: "Lista de facturas", resultado: facturas });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const actualizarCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { val_tot_fac, fec_fac, ide_cli, ide_caj } = req.body;
    const factura = await Factura.findByPk(id);
    if (!factura) {
      return res
        .status(404)
        .json({ mensaje: "Factura no encontrada", resultado: null });
    }
    await factura.update({ val_tot_fac, fec_fac, ide_cli, ide_caj });
    res.status(200).json({ mensaje: "Factura actualizada", resultado: factura });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const borrarCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const factura = await Factura.findByPk(id);
    if (!factura) {
      return res
        .status(404)
        .json({ mensaje: "Factura no encontrada", resultado: null });
    }
    await factura.destroy();
    res.status(200).json({ mensaje: "Factura eliminada", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarCompra,
  listarCompras,
  actualizarCompra,
  borrarCompra,
};
