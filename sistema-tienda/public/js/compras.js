const API_BASE = "http://localhost:3000";

// ========== CARGAR LISTA DE COMPRAS ==========
async function cargarCompras() {
  try {
    const res = await fetch(`${API_BASE}/compras/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaCompras");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((c) => `
          <tr>
            <td>${c.nro_fac}</td>
            <td>${c.ide_cli}</td>
            <td>${c.ide_caj}</td>
            <td>${c.val_tot_fac}</td>
            <td>${c.fec_fac ? new Date(c.fec_fac).toLocaleDateString() : ''}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="descargarFactura(${c.nro_fac})">
                <i class="bi bi-download"></i> Factura
              </button>
            </td>
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="6" class="text-center">No hay compras registradas</td></tr>';
    }
  } catch (err) {
    document.getElementById("tablaCompras").innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar compras</td></tr>';
  }
}

// Función para descargar la factura como PDF
async function descargarFactura(nro_fac) {
  // Asegúrate de tener jsPDF cargado en tu HTML
  if (!window.jspdf) {
    alert("jsPDF no está cargado");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/compras/factura/${nro_fac}`);
    const data = await res.json();
    if (!data.resultado) {
      alert("No se pudo obtener la factura");
      return;
    }
    const factura = data.resultado;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Factura de Compra", 14, 15);
    doc.setFontSize(10);
    doc.text(`Nro. Factura: ${factura.nro_fac}`, 14, 25);
    doc.text(`Fecha: ${new Date(factura.fec_fac).toLocaleString()}`, 14, 31);
    doc.text(`Cliente: ${factura.Cliente?.nom_cli || factura.ide_cli}`, 14, 37);
    doc.text(`Cédula: ${factura.Cliente?.ide_cli || ''}`, 14, 43);
    doc.text(`Dirección: ${factura.Cliente?.dir_cli || ''}`, 14, 49);
    doc.text(`Teléfono: ${factura.Cliente?.tel_cli || ''}`, 14, 55);
    doc.text(`Cajero: ${factura.Cajero?.nom_caj || factura.ide_caj}`, 14, 61);

    // Tabla de productos
    doc.setFontSize(12);
    doc.text("Productos:", 14, 70);
    doc.setFontSize(10);
    let y = 76;
    doc.text("Código", 14, y);
    doc.text("Nombre", 34, y);
    doc.text("Cantidad", 84, y);
    doc.text("Precio Unit.", 114, y);
    doc.text("Subtotal", 154, y);
    y += 6;
    factura.DetalleFacturas.forEach(det => {
      doc.text(`${det.cod_pro}`, 14, y);
      doc.text(`${det.Producto?.nom_pro || ''}`, 34, y);
      doc.text(`${det.cant_pro}`, 84, y);
      doc.text(`$${parseFloat(det.val_uni_pro).toFixed(2)}`, 114, y);
      doc.text(`$${parseFloat(det.val_total_pro).toFixed(2)}`, 154, y);
      y += 6;
    });

    y += 6;
    doc.setFontSize(12);
    doc.text(`Total: $${parseFloat(factura.val_tot_fac).toFixed(2)}`, 14, y);

    doc.save(`Factura_${factura.nro_fac}.pdf`);
  } catch (err) {
    alert("Error al descargar la factura");
  }
}

// ========== REGISTRAR COMPRA ==========
const formCompra = document.getElementById("formCompra");
if (formCompra) {
  formCompra.addEventListener("submit", async (e) => {
    e.preventDefault();
    const compra = {
      nro_fac: document.getElementById("nroFactura").value.trim(),
      ide_cli: document.getElementById("clienteCedula").value.trim(),
      ide_caj: document.getElementById("cajeroId").value.trim(),
      fec_fac: document.getElementById("fechaCompra").value,
    };
    try {
      const res = await fetch(`${API_BASE}/compras/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compra),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Compra registrada correctamente");
        formCompra.reset();
        cargarCompras();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar compra"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== MODIFICAR COMPRA ==========
const formActualizarCompra = document.getElementById("formActualizarCompra");
if (formActualizarCompra) {
  formActualizarCompra.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("nroFacturaActualizar").value.trim();
    const compra = {
      ide_cli: document.getElementById("clienteCedulaActualizar").value.trim(),
      ide_caj: document.getElementById("cajeroIdActualizar").value.trim(),
      fec_fac: document.getElementById("fechaCompraActualizar").value,
    };
    try {
      const res = await fetch(`${API_BASE}/compras/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compra),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Compra actualizada correctamente");
        formActualizarCompra.reset();
        cargarCompras();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al actualizar compra"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== ELIMINAR COMPRA ==========
const formEliminarCompra = document.getElementById("formEliminarCompra");
if (formEliminarCompra) {
  formEliminarCompra.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("nroFacturaEliminar").value.trim();
    if (!id) {
      alert("❌ Debe ingresar el número de factura");
      return;
    }
    if (!confirm(`¿Está seguro de eliminar la compra con Nro. Factura ${id}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/compras/borrar/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Compra eliminada correctamente");
        formEliminarCompra.reset();
        cargarCompras();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al eliminar compra"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== BUSCADOR DE COMPRAS ==========
const buscador = document.getElementById("buscadorCompras");
if (buscador) {
  buscador.addEventListener("input", (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaCompras tr");
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(busqueda) ? "" : "none";
    });
  });
}

// ========== CARGAR CAJEROS EN EL DROPDOWN ==========
async function cargarCajerosDropdown() {
  try {
    const res = await fetch(`${API_BASE}/cajeros/listar`);
    const data = await res.json();
    const select = document.getElementById("cajeroId");
    if (select && data.resultado) {
      select.innerHTML = '<option value="">Seleccione cajero</option>' +
        data.resultado.map(caj =>
          `<option value="${caj.ide_caj}">${caj.ide_caj} - ${caj.nom_caj}</option>`
        ).join('');
    }
  } catch (err) {
    const select = document.getElementById("cajeroId");
    if (select) select.innerHTML = '<option value="">Seleccione cajero</option>';
  }
}

// ========== CARGAR CLIENTES EN EL DROPDOWN ==========
async function cargarClientesDropdown() {
  try {
    const res = await fetch(`${API_BASE}/clientes/listar`);
    const data = await res.json();
    const select = document.getElementById("clienteCedula");
    if (select && data.resultado) {
      select.innerHTML = '<option value="">Seleccione cliente</option>' +
        data.resultado.map(cli =>
          `<option value="${cli.ide_cli}">${cli.ide_cli} - ${cli.nom_cli}</option>`
        ).join('');
    }
  } catch (err) {
    const select = document.getElementById("clienteCedula");
    if (select) select.innerHTML = '<option value="">Seleccione cliente</option>';
  }
}

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarCompras();
  cargarCajerosDropdown();
  cargarClientesDropdown();
  
  // Ocultar tabs de modificar y eliminar para cajeros
  const auth = verificarAutenticacion();
  if (auth && auth.perfil === 'cajero') {
    ocultarTab('modificar-tab');
    ocultarTab('eliminar-tab');
  }
});
