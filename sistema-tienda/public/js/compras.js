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
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="5" class="text-center">No hay compras registradas</td></tr>';
    }
  } catch (err) {
    document.getElementById("tablaCompras").innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar compras</td></tr>';
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
      val_tot_fac: document.getElementById("total").value.trim(),
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
      val_tot_fac: document.getElementById("totalActualizar").value.trim(),
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

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarCompras();
  cargarCajerosDropdown();
});
