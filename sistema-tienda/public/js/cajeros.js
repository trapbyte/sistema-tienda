const API_BASE = "http://localhost:3000";

// ========== CARGAR LISTA DE CAJEROS ==========
async function cargarCajeros() {
  try {
    const res = await fetch(`${API_BASE}/cajeros/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaCajeros");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((c) => `
          <tr>
            <td>${c.ide_caj}</td>
            <td>${c.nom_caj}</td>
            <td>${c.tel_caj || ''}</td>
            <td>${c.dir_caj || ''}</td>
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="4" class="text-center">No hay cajeros registrados</td></tr>';
    }
  } catch (err) {
    document.getElementById("tablaCajeros").innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar cajeros</td></tr>';
  }
}

// ========== REGISTRAR CAJERO ==========
const formCajero = document.getElementById("formCajero");
if (formCajero) {
  formCajero.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cajero = {
      ide_caj: document.getElementById("idCajero").value.trim(),
      nom_caj: document.getElementById("nombreCajero").value.trim(),
      tel_caj: document.getElementById("telefonoCajero").value.trim(),
      dir_caj: document.getElementById("direccionCajero").value.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/cajeros/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cajero),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Cajero registrado correctamente");
        formCajero.reset();
        cargarCajeros();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar cajero"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== MODIFICAR CAJERO ==========
const formActualizarCajero = document.getElementById("formActualizarCajero");
if (formActualizarCajero) {
  formActualizarCajero.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("idCajeroActualizar").value.trim();
    const cajero = {
      nom_caj: document.getElementById("nombreCajeroActualizar").value.trim(),
      tel_caj: document.getElementById("telefonoCajeroActualizar").value.trim(),
      dir_caj: document.getElementById("direccionCajeroActualizar").value.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/cajeros/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cajero),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Cajero actualizado correctamente");
        formActualizarCajero.reset();
        cargarCajeros();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al actualizar cajero"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== ELIMINAR CAJERO ==========
const formEliminarCajero = document.getElementById("formEliminarCajero");
if (formEliminarCajero) {
  formEliminarCajero.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("idCajeroEliminar").value.trim();
    if (!id) {
      alert("❌ Debe ingresar el ID del cajero");
      return;
    }
    if (!confirm(`¿Está seguro de eliminar el cajero con ID ${id}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/cajeros/borrar/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Cajero eliminado correctamente");
        formEliminarCajero.reset();
        cargarCajeros();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al eliminar cajero"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== BUSCADOR DE CAJEROS ==========
const buscador = document.getElementById("buscadorCajeros");
if (buscador) {
  buscador.addEventListener("input", (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaCajeros tr");
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(busqueda) ? "" : "none";
    });
  });
}

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarCajeros();
});
