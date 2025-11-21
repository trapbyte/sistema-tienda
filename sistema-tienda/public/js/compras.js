window.API_BASE = window.API_BASE || "https://sistema-tienda-c3xf.onrender.com";
//window.API_BASE = window.API_BASE || "http://localhost:3000";

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
  try {
    // Mostrar indicador de carga
    const btnDescarga = event.target.closest('button');
    const textoOriginal = btnDescarga.innerHTML;
    btnDescarga.disabled = true;
    btnDescarga.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
    
    const url = `${API_BASE}/compras/descargar-factura/${nro_fac}`;
    
    // Realizar la petición con manejo de errores
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
    }
    
    // Verificar que la respuesta sea un PDF
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      const errorText = await response.text();
      throw new Error(`La respuesta no es un PDF válido. ${errorText}`);
    }
    
    // Convertir la respuesta a blob
    const blob = await response.blob();
    
    // Crear URL del blob y descargar
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `factura_${nro_fac}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    // Restaurar botón
    btnDescarga.disabled = false;
    btnDescarga.innerHTML = textoOriginal;
    
    // Mostrar mensaje de éxito
    mostrarMensaje('Factura descargada correctamente', 'success');
    
  } catch (err) {
    console.error('Error al descargar la factura:', err);
    
    // Restaurar botón si existe
    if (event && event.target) {
      const btnDescarga = event.target.closest('button');
      if (btnDescarga) {
        btnDescarga.disabled = false;
        btnDescarga.innerHTML = '<i class="bi bi-download"></i> Factura';
      }
    }
    
    // Mostrar mensaje de error detallado
    let mensajeError = '❌ Error al descargar la factura';
    
    if (err.message.includes('500')) {
      mensajeError += '\n\n🔧 Error del servidor al generar el PDF.\nPosibles causas:\n- La factura no existe\n- Faltan datos relacionados\n- Error en la base de datos\n\nPor favor, contacte al administrador.';
    } else if (err.message.includes('404')) {
      mensajeError += '\n\nLa factura no fue encontrada.';
    } else if (err.message.includes('Failed to fetch')) {
      mensajeError += '\n\nNo se pudo conectar con el servidor. Verifique su conexión a internet.';
    } else {
      mensajeError += '\n\n' + err.message;
    }
    
    alert(mensajeError);
  }
}

// Función auxiliar para mostrar mensajes temporales
function mostrarMensaje(mensaje, tipo = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
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
