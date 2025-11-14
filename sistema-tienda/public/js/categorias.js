const API_BASE = "http://localhost:3000";

// ========== CARGAR LISTA DE CATEGORÍAS ==========
async function cargarCategorias() {
  try {
    const res = await fetch(`${API_BASE}/categorias/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaCategorias");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((c) => `
          <tr>
            <td>${c.cod_cat}</td>
            <td>${c.nom_cat}</td>
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="2" class="text-center">No hay categorías registradas</td></tr>';
    }
  } catch (err) {
    document.getElementById("tablaCategorias").innerHTML = '<tr><td colspan="2" class="text-center text-danger">Error al cargar categorías</td></tr>';
  }
}

// ========== REGISTRAR CATEGORÍA ==========
const formCategoria = document.getElementById("formCategoria");
if (formCategoria) {
  formCategoria.addEventListener("submit", async (e) => {
    e.preventDefault();
    const categoria = {
      cod_cat: document.getElementById("codigoCategoria").value.trim(),
      nom_cat: document.getElementById("nombreCategoria").value.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/categorias/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoria),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Categoría registrada correctamente");
        formCategoria.reset();
        cargarCategorias();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar categoría"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== ACTUALIZAR CATEGORÍA ==========
const formActualizar = document.getElementById("formActualizarCategoria");
if (formActualizar) {
  formActualizar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigoActualizar").value.trim();
    const categoria = {
      nom_cat: document.getElementById("nombreActualizar").value.trim(),
    };
    try {
      const res = await fetch(`${API_BASE}/categorias/actualizar/${codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoria),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Categoría actualizada correctamente");
        formActualizar.reset();
        cargarCategorias();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al actualizar categoría"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== ELIMINAR CATEGORÍA ==========
const formEliminar = document.getElementById("formEliminarCategoria");
if (formEliminar) {
  formEliminar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigoEliminar").value.trim();
    if (!confirm(`¿Está seguro de eliminar la categoría con código ${codigo}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/categorias/borrar/${codigo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Categoría eliminada correctamente");
        formEliminar.reset();
        cargarCategorias();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al eliminar categoría"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== BUSCADOR DE CATEGORÍAS ==========
const buscador = document.getElementById("buscadorCategorias");
if (buscador) {
  buscador.addEventListener("input", (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaCategorias tr");
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(busqueda) ? "" : "none";
    });
  });
}

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();
  
  // Ocultar tabs para cajeros (SOLO lectura)
  const auth = verificarAutenticacion();
  if (auth && auth.perfil === 'cajero') {
    ocultarTab('registrar-tab');
    ocultarTab('modificar-tab');
    ocultarTab('eliminar-tab');
  }
});
