const express = require('express');
const enrutador = express.Router();
const compraControlador = require('../controladores/compraControlador');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Mantener una instancia del navegador reutilizable
let browserInstance = null;
let browserLaunching = false;

const getBrowser = async () => {
  // Si ya hay un navegador conectado, devolverlo
  if (browserInstance) {
    try {
      if (browserInstance.isConnected()) {
        return browserInstance;
      }
    } catch (e) {
      browserInstance = null;
    }
  }

  // Evitar lanzar múltiples navegadores simultáneamente
  if (browserLaunching) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getBrowser();
  }

  browserLaunching = true;
  try {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions'
      ],
      timeout: 10000
    });
    
    // Manejar el cierre del navegador
    browserInstance.on('disconnected', () => {
      browserInstance = null;
    });

    return browserInstance;
  } finally {
    browserLaunching = false;
  }
};

// Rutas específicas primero
enrutador.get('/listar', compraControlador.listarCompras);
enrutador.post('/registrar', compraControlador.registrarCompra);
enrutador.get('/factura/:nro_fac', compraControlador.obtenerFacturaDetallada); // <-- Mueve esta línea arriba

// Ruta para descargar factura como PDF
enrutador.get('/descargar-factura/:nro_fac', async (req, res) => {
  let page = null;
  try {
    const { nro_fac } = req.params;
    
    // Validar parámetro
    if (!nro_fac) {
      return res.status(400).json({ mensaje: 'Número de factura requerido' });
    }

    // Obtener factura con detalles
    const factura = await compraControlador.obtenerFacturaDetalladaRaw(nro_fac);
    
    if (!factura) {
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    // Verificar que tenga detalles
    if (!factura.DetalleFacturas || factura.DetalleFacturas.length === 0) {
      return res.status(400).json({ mensaje: 'La factura no tiene productos asociados' });
    }

    // Leer la plantilla HTML
    const templatePath = path.join(__dirname, '../../public/templates/factura.html');
    
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ mensaje: 'Plantilla de factura no encontrada' });
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Generar las filas de la tabla de detalles
    let detallesHTML = '';
    factura.DetalleFacturas.forEach((det, idx) => {
      const productoNombre = det.Producto?.nom_pro || 'Sin nombre';
      const productoValor = det.Producto?.val_pro || det.val_uni_pro || 0;
      
      detallesHTML += `
        <tr>
          <td class="item-number">${idx + 1}</td>
          <td class="item-name">${productoNombre}</td>
          <td>${det.cant_pro || 0}</td>
          <td class="item-price">$${Number(productoValor).toFixed(2)}</td>
          <td class="item-price">$${Number(det.val_total_pro || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    // Formatear fecha
    const fechaFormateada = factura.fec_fac 
      ? new Date(factura.fec_fac).toLocaleString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : 'Fecha no disponible';

    // Reemplazar placeholders
    html = html
      .replace(/\{\{detalles\}\}/g, detallesHTML)
      .replace(/\{\{nro_fac\}\}/g, factura.nro_fac || '')
      .replace(/\{\{fecha\}\}/g, fechaFormateada)
      .replace(/\{\{cliente\}\}/g, factura.Cliente?.nom_cli || 'Cliente no disponible')
      .replace(/\{\{telefono\}\}/g, factura.Cliente?.tel_cli || 'N/A')
      .replace(/\{\{direccion\}\}/g, factura.Cliente?.dir_cli || 'N/A')
      .replace(/\{\{cajero\}\}/g, factura.Cajero?.nom_caj || 'Cajero no disponible')
      .replace(/\{\{total_factura\}\}/g, Number(factura.val_tot_fac || 0).toFixed(2));

    // Obtener navegador reutilizable
    const browser = await getBrowser();
    page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 800, height: 600 });
    
    // Cargar HTML con timeout
    await page.setContent(html, { 
      waitUntil: 'networkidle0', 
      timeout: 10000 
    });
    
    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: false,
      timeout: 15000
    });
    
    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura_${nro_fac}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    
    // Respuesta de error detallada
    const errorMessage = error.message || 'Error desconocido';
    const errorStack = process.env.NODE_ENV === 'development' ? error.stack : undefined;
    
    res.status(500).json({ 
      mensaje: 'Error al generar el PDF', 
      error: errorMessage,
      stack: errorStack
    });
  } finally {
    // Cerrar página si existe
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.error('Error al cerrar página:', e);
      }
    }
  }
});

enrutador.get('/:id', compraControlador.obtenerCompraPorId);
enrutador.put('/actualizar/:id', compraControlador.actualizarCompra);
enrutador.delete('/borrar/:id', compraControlador.eliminarCompra);

module.exports = enrutador;
