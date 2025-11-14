const { PuntosCliente, Cliente, DetallePuntos } = require('../baseDatos');

const listarPuntosClientes = async (req, res) => {
  try {
    const puntos = await PuntosCliente.findAll({
      include: [{ model: Cliente, attributes: ['ide_cli', 'nom_cli'] }]
    });
    res.status(200).json({ mensaje: "Lista de puntos por cliente", resultado: puntos });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const obtenerPuntosCliente = async (req, res) => {
  try {
    const { ide_cli } = req.params;
    const puntos = await PuntosCliente.findOne({
      where: { ide_cli },
      include: [{ model: Cliente, attributes: ['ide_cli', 'nom_cli'] }]
    });
    if (!puntos) {
      return res.status(404).json({ mensaje: "No se encontraron puntos para este cliente", resultado: null });
    }
    res.status(200).json({ mensaje: "Puntos del cliente", resultado: puntos });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const listarDetallePuntos = async (req, res) => {
  try {
    const detalles = await DetallePuntos.findAll({
      include: [{ model: Cliente, attributes: ['ide_cli', 'nom_cli'] }],
      order: [['fecha', 'DESC']]
    });
    res.status(200).json({ mensaje: "Historial de puntos", resultado: detalles });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

const canjearPuntos = async (req, res) => {
  try {
    const { ide_cli, puntos_a_canjear, descripcion } = req.body;
    
    const puntosCliente = await PuntosCliente.findOne({ where: { ide_cli } });
    if (!puntosCliente) {
      return res.status(404).json({ mensaje: "Cliente no tiene puntos registrados", resultado: null });
    }
    
    if (puntosCliente.puntos_actual < puntos_a_canjear) {
      return res.status(400).json({ mensaje: "Puntos insuficientes", resultado: null });
    }

    // Actualizar puntos
    await puntosCliente.update({
      puntos_actual: puntosCliente.puntos_actual - puntos_a_canjear,
      puntos_totales_canjeados: puntosCliente.puntos_totales_canjeados + puntos_a_canjear,
      ultima_actualizacion: new Date()
    });

    // Registrar canje
    await DetallePuntos.create({
      ide_cli,
      nro_fac: null,
      tipo_movimiento: 'CANJE',
      puntos: -puntos_a_canjear,
      descripcion: descripcion || 'Canje de puntos',
      fecha: new Date()
    });

    res.status(200).json({ mensaje: "Puntos canjeados exitosamente", resultado: puntosCliente });
  } catch (error) {
    res.status(400).json({ mensaje: error.message, resultado: null });
  }
};

module.exports = {
  listarPuntosClientes,
  obtenerPuntosCliente,
  listarDetallePuntos,
  canjearPuntos
};
