const { Factura, Cliente, Cajero, DetalleFactura, Producto, PuntosCliente, DetallePuntos } = require("../baseDatos");

const registrarCompra = async (req, res) => {
  try {
    const { nro_fac, fec_fac, ide_cli, ide_caj } = req.body;
    const cliente = await Cliente.findByPk(ide_cli);
    if (!cliente) {
      return res
        .status(404)
        .json({ mensaje: "Cliente no encontrado", resultado: null });
    }

    // Registrar factura con total en 0 (se actualizará después)
    const nuevaFactura = await Factura.create({
      nro_fac,
      val_tot_fac: 0,
      fec_fac,
      ide_cli,
      ide_caj,
    });

    // Calcular el total sumando los detalles (si ya existen)
    const detalles = await DetalleFactura.findAll({ where: { nro_fac } });
    let totalFactura = 0;
    if (detalles && detalles.length > 0) {
      totalFactura = detalles.reduce((sum, d) => sum + parseFloat(d.val_total_pro), 0);
      await nuevaFactura.update({ val_tot_fac: totalFactura });
    }

    // Calcular puntos: 1 punto por cada $1000
    const puntosGanados = Math.floor(totalFactura / 1000);

    if (puntosGanados > 0) {
      // Buscar o crear registro de puntos del cliente
      let [puntosCliente, created] = await PuntosCliente.findOrCreate({
        where: { ide_cli },
        defaults: {
          puntos_actual: 0,
          puntos_totales_obtenidos: 0,
          puntos_totales_canjeados: 0,
        },
      });

      // Actualizar puntos
      await puntosCliente.update({
        puntos_actual: puntosCliente.puntos_actual + puntosGanados,
        puntos_totales_obtenidos:
          puntosCliente.puntos_totales_obtenidos + puntosGanados,
        ultima_actualizacion: new Date(),
      });

      // Registrar detalle de puntos
      await DetallePuntos.create({
        ide_cli,
        nro_fac,
        tipo_movimiento: "GANANCIA",
        puntos: puntosGanados,
        descripcion: `Puntos ganados por compra #${nro_fac} de $${totalFactura}`,
        fecha: new Date(),
      });
    }

    res
      .status(201)
      .json({ mensaje: "Factura registrada y puntos acreditados", resultado: nuevaFactura });
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
    const { fec_fac, ide_cli, ide_caj } = req.body;
    const factura = await Factura.findByPk(id);
    if (!factura) {
      return res
        .status(404)
        .json({ mensaje: "Factura no encontrada", resultado: null });
    }
    // Recalcular el total sumando los detalles actuales
    const detalles = await DetalleFactura.findAll({ where: { nro_fac: id } });
    let totalFactura = 0;
    if (detalles && detalles.length > 0) {
      totalFactura = detalles.reduce((sum, d) => sum + parseFloat(d.val_total_pro), 0);
    }
    await factura.update({ val_tot_fac: totalFactura, fec_fac, ide_cli, ide_caj });
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

const obtenerFacturaDetallada = async (req, res) => {
  try {
    const { nro_fac } = req.params;
    const factura = await Factura.findByPk(nro_fac, {
      include: [
        { model: Cliente, attributes: ['ide_cli', 'nom_cli', 'dir_cli', 'tel_cli'] },
        { model: Cajero, attributes: ['ide_caj', 'nom_caj'] },
        {
          model: DetalleFactura,
          include: [
            { model: Producto, attributes: ['cod_pro', 'nom_pro'] }
          ]
        }
      ]
    });
    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada", resultado: null });
    }
    res.status(200).json({ mensaje: "Factura detallada", resultado: factura });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerCompraPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await Factura.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['ide_cli', 'nom_cli'] },
        { model: Cajero, attributes: ['ide_caj', 'nom_caj'] },
        { 
          model: DetalleFactura, 
          include: [{ model: Producto, attributes: ['nom_pro', 'pre_pro'] }]
        }
      ]
    });
    if (!compra) {
      return res.status(404).json({ mensaje: "Compra no encontrada", resultado: null });
    }
    res.status(200).json({ mensaje: "Compra encontrada", resultado: compra });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  listarCompras,
  registrarCompra,
  obtenerCompraPorId,
  actualizarCompra,
  eliminarCompra: borrarCompra
};
