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
  try {
    const { nro_fac } = req.params;
    const factura = await compraControlador.obtenerFacturaDetalladaRaw(nro_fac);
    if (!factura) return res.status(404).send('Factura no encontrada');

    // Leer la plantilla HTML
    let html = fs.readFileSync(path.join(__dirname, '../../public/templates/factura.html'), 'utf8');

    // Generar las filas de la tabla de detalles
    let detallesHTML = '';
    factura.DetalleFacturas.forEach((det, idx) => {
      detallesHTML += `
        <tr>
          <td class="item-number">${idx + 1}</td>
          <td class="item-name">${det.Producto.nom_pro}</td>
          <td>${det.cant_pro}</td>
          <td class="item-price">$${Number(det.Producto.val_pro).toFixed(2)}</td>
          <td class="item-price">$${Number(det.val_total_pro).toFixed(2)}</td>
        </tr>
      `;
    });

    // Reemplazar los placeholders (usando regex para reemplazar todas las ocurrencias)
    html = html
      .replace(/\{\{detalles\}\}/g, detallesHTML)
      .replace(/\{\{nro_fac\}\}/g, factura.nro_fac)
      .replace(/\{\{fecha\}\}/g, new Date(factura.fec_fac).toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
      .replace(/\{\{cliente\}\}/g, factura.Cliente.nom_cli)
      .replace(/\{\{telefono\}\}/g, factura.Cliente.tel_cli || 'N/A')
      .replace(/\{\{direccion\}\}/g, factura.Cliente.dir_cli || 'N/A')
      .replace(/\{\{cajero\}\}/g, factura.Cajero.nom_caj)
      .replace(/\{\{total_factura\}\}/g, Number(factura.val_tot_fac).toFixed(2));

    // Reutilizar el navegador en lugar de lanzar uno nuevo cada vez
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    try {
      // Configurar viewport más pequeño para renderizado más rápido
      await page.setViewport({ width: 800, height: 600 });
      await page.setContent(html, { waitUntil: 'load', timeout: 5000 });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        },
        preferCSSPageSize: false
      });
      
      // Enviar el PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura_${nro_fac}.pdf`);
      res.send(pdfBuffer);
    } finally {
      await page.close();
    }

  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar el PDF');
  }
});

enrutador.get('/:id', compraControlador.obtenerCompraPorId);
enrutador.put('/actualizar/:id', compraControlador.actualizarCompra);
enrutador.delete('/borrar/:id', compraControlador.eliminarCompra);

module.exports = enrutador;
