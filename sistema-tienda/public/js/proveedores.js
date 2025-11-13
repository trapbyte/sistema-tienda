const API_BASE = "http://localhost:3000";

// ========== CARGAR LISTA DE PROVEEDORES ==========
async function cargarProveedores() {
  try {
    const res = await fetch(`${API_BASE}/proveedores/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaProveedores");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((p) => `
          <tr>
            <td>${p.nit_prov}</td>
            <td>${p.nom_prov}</td>
            <td>${p.dir_prov || ''}</td>
            <td>${p.tel_prov || ''}</td>
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="4" class="text-center">No hay proveedores registrados</td></tr>';
    }
  } catch (err) {
    document.getElementById("tablaProveedores").innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar proveedores</td></tr>';
  }
}

// ========== REGISTRAR PROVEEDOR ==========
const formProveedor = document.getElementById("formProveedor");
if (formProveedor) {
  formProveedor.addEventListener("submit", async (e) => {
    e.preventDefault();
    const proveedor = {
      nit_prov: document.getElementById("nitProveedor").value.trim(),
      nom_prov: document.getElementById("nombreProveedor").value.trim(),
      dir_prov: document.getElementById("direccionProveedor").value.trim(),
      tel_prov: document.getElementById("telefonoProveedor").value.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/proveedores/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proveedor),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Proveedor registrado correctamente");
        formProveedor.reset();
        cargarProveedores();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar proveedor"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== MODIFICAR PROVEEDOR ==========
const formActualizarProveedor = document.getElementById("formActualizarProveedor");
if (formActualizarProveedor) {
  formActualizarProveedor.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nit = document.getElementById("nitActualizar").value.trim();
    const proveedor = {
      nom_prov: document.getElementById("nombreActualizar").value.trim(),
      dir_prov: document.getElementById("direccionActualizar").value.trim(),
      tel_prov: document.getElementById("telefonoActualizar").value.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/proveedores/actualizar/${nit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proveedor),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Proveedor actualizado correctamente");
        formActualizarProveedor.reset();
        cargarProveedores();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al actualizar proveedor"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== ELIMINAR PROVEEDOR ==========
const formEliminarProveedor = document.getElementById("formEliminarProveedor");
if (formEliminarProveedor) {
  formEliminarProveedor.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nit = document.getElementById("nitEliminar").value.trim();
    if (!nit) {
      alert("❌ Debe ingresar el NIT del proveedor");
      return;
    }
    if (!confirm(`¿Está seguro de eliminar el proveedor con NIT ${nit}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/proveedores/borrar/${nit}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Proveedor eliminado correctamente");
        formEliminarProveedor.reset();
        cargarProveedores();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al eliminar proveedor"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== BUSCADOR DE PROVEEDORES ==========
const buscador = document.getElementById("buscadorProveedores");
if (buscador) {
  buscador.addEventListener("input", (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaProveedores tr");
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(busqueda) ? "" : "none";
    });
  });
}

// ========== CARGAR PROVEEDORES Y PRODUCTOS PARA RELACIÓN ==========
async function cargarDropdownsRelacion() {
  // Proveedores
  try {
    const resProv = await fetch(`${API_BASE}/proveedores/listar`);
    const dataProv = await resProv.json();
    const selectProv = document.getElementById("relacionNitProveedor");
    if (selectProv && dataProv.resultado) {
      selectProv.innerHTML = '<option value="">Seleccione proveedor</option>' +
        dataProv.resultado.map(p =>
          `<option value="${p.nit_prov}">${p.nit_prov} - ${p.nom_prov}</option>`
        ).join('');
    }
  } catch {}
  // Productos
  try {
    const resProd = await fetch(`${API_BASE}/productos/listar`);
    const dataProd = await resProd.json();
    const selectProd = document.getElementById("relacionCodProducto");
    if (selectProd && dataProd.resultado) {
      selectProd.innerHTML = '<option value="">Seleccione producto</option>' +
        dataProd.resultado.map(p =>
          `<option value="${p.cod_pro}">${p.cod_pro} - ${p.nom_pro}</option>`
        ).join('');
    }
  } catch {}
}

// ========== CARGAR RELACIONES PROVEEDOR-PRODUCTO ==========
async function cargarProveedorProducto() {
  try {
    const res = await fetch(`${API_BASE}/proveedores-productos/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaProveedorProducto");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((r) => `
          <tr>
            <td>${r.nit_prov}</td>
            <td>${r.cod_pro}</td>
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="2" class="text-center">No hay relaciones registradas</td></tr>';
    }
  } catch {
    document.getElementById("tablaProveedorProducto").innerHTML = '<tr><td colspan="2" class="text-center text-danger">Error al cargar relaciones</td></tr>';
  }
}

// ========== REGISTRAR RELACIÓN PROVEEDOR-PRODUCTO ==========
const formProveedorProducto = document.getElementById("formProveedorProducto");
if (formProveedorProducto) {
  formProveedorProducto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nit_prov = document.getElementById("relacionNitProveedor").value;
    const cod_pro = document.getElementById("relacionCodProducto").value;
    if (!nit_prov || !cod_pro) {
      alert("❌ Seleccione proveedor y producto");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/proveedores-productos/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nit_prov, cod_pro }),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Relación registrada correctamente");
        formProveedorProducto.reset();
        cargarProveedorProducto();
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar relación"));
      }
    } catch {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== BUSCADOR DE RELACIONES ==========
const buscadorRelaciones = document.getElementById("buscadorRelaciones");
if (buscadorRelaciones) {
  buscadorRelaciones.addEventListener("input", (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaProveedorProducto tr");
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(busqueda) ? "" : "none";
    });
  });
}

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarProveedores();
  cargarDropdownsRelacion();
  cargarProveedorProducto();
});
