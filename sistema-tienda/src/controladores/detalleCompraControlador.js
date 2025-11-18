const { DetalleFactura, Factura, Producto } = require('../baseDatos');

async function actualizarTotalFactura(nro_fac) {
  const detalles = await DetalleFactura.findAll({ where: { nro_fac } });
  const total = detalles.reduce((sum, d) => sum + parseFloat(d.val_total_pro), 0);
  await Factura.update({ val_tot_fac: total }, { where: { nro_fac } });
}

const registrarDetalleCompra = async (req, res) => {
  try {
    const { cod_pro, nro_fac, val_uni_pro, cant_pro } = req.body;

    // Validaciones básicas
    const factura = await Factura.findByPk(nro_fac);
    if (!factura) {
      return res.status(404).json({ mensaje: "Factura no encontrada", resultado: null });
    }

    const producto = await Producto.findByPk(cod_pro);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado", resultado: null });
    }

    // VALIDAR STOCK DISPONIBLE
    if (producto.cant_pro < cant_pro) {
      return res.status(400).json({ 
        mensaje: `Stock insuficiente. Disponible: ${producto.cant_pro}, Solicitado: ${cant_pro}`, 
        resultado: null 
      });
    }

    // Una factura puede tener uno o más productos (varios detalles)
    const val_total_pro = cant_pro * val_uni_pro;
    const nuevoDetalle = await DetalleFactura.create({
      cod_pro,
      nro_fac,
      val_uni_pro,
      cant_pro,
      val_total_pro
    });

    // DISMINUIR EL STOCK DEL PRODUCTO
    await producto.update({ 
      cant_pro: producto.cant_pro - cant_pro 
    });

    // Actualizar total de la factura
    await actualizarTotalFactura(nro_fac);

    res.status(201).json({ mensaje: "Detalle de factura registrado y stock actualizado", resultado: nuevoDetalle });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarDetallesCompra = async (req, res) => {
  try {
    const detalles = await DetalleFactura.findAll({
      include: [
        { model: Producto, attributes: ['nom_pro', 'val_pro'] },
        { model: Factura, attributes: ['nro_fac', 'fec_fac', 'val_tot_fac'] }
      ]
    });
    res.status(200).json({ mensaje: "Lista de detalles de factura", resultado: detalles });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const actualizarDetalleCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { val_uni_pro, cant_pro } = req.body;

    const detalle = await DetalleFactura.findByPk(id);
    if (!detalle) {
      return res.status(404).json({ mensaje: "Detalle de factura no encontrado", resultado: null });
    }

    const val_total_pro = cant_pro * val_uni_pro;
    await detalle.update({ val_uni_pro, cant_pro, val_total_pro });

    // Actualizar total de la factura
    await actualizarTotalFactura(detalle.nro_fac);

    res.status(200).json({ mensaje: "Detalle de factura actualizado", resultado: detalle });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const eliminarDetalleCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await DetalleFactura.findByPk(id);

    if (!detalle) {
      return res.status(404).json({ mensaje: "Detalle de factura no encontrado", resultado: null });
    }

    const nro_fac = detalle.nro_fac;
    await detalle.destroy();

    // Actualizar total de la factura
    await actualizarTotalFactura(nro_fac);

    res.status(200).json({ mensaje: "Detalle de factura eliminado", resultado: null });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  registrarDetalleCompra,
  listarDetallesCompra,
  actualizarDetalleCompra,
  eliminarDetalleCompra
};
