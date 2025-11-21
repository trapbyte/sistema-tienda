window.API_BASE = window.API_BASE || "https://sistema-tienda-c3xf.onrender.com";

//const API_BASE = "http://localhost:3000";

// ========== CARGAR LISTA DE CLIENTES ==========
async function cargarClientes() {
  try {
    const res = await fetch(`${API_BASE}/clientes/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaClientes");
    
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((c) => `
          <tr>
            <td>${c.ide_cli}</td>
            <td>${c.nom_cli}</td>
            <td>${c.dir_cli || 'N/A'}</td>
            <td>${c.tel_cli || 'N/A'}</td>
          </tr>
        `)
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="4" class="text-center">No hay clientes registrados</td></tr>';
    }
  } catch (err) {
    console.error("Error al cargar clientes:", err);
    document.getElementById("tablaClientes").innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar clientes</td></tr>';
  }
}

// ========== REGISTRAR CLIENTE ==========
const formCliente = document.getElementById("formCliente");
if (formCliente) {
  formCliente.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const cliente = {
      ide_cli: document.getElementById("cedula").value.trim(),
      nom_cli: document.getElementById("nombre").value.trim(),
      dir_cli: document.getElementById("direccion").value.trim(),
      tel_cli: document.getElementById("telefono").value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/clientes/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente),
      });
      const data = await res.json();
      
      if (data.resultado) {
        alert("✅ Cliente registrado correctamente");
        formCliente.reset();
        cargarClientes();
        // Cambiar al tab de listar
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar cliente"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
      console.error(err);
    }
  });
}

// ========== ACTUALIZAR CLIENTE ==========
const formActualizar = document.getElementById("formActualizarCliente");
if (formActualizar) {
  formActualizar.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const cedula = document.getElementById("cedulaActualizar").value.trim();
    const cliente = {
      nom_cli: document.getElementById("nombreActualizar").value.trim(),
      dir_cli: document.getElementById("direccionActualizar").value.trim(),
      tel_cli: document.getElementById("telefonoActualizar").value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/clientes/actualizar/${cedula}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente),
      });
      const data = await res.json();
      
      if (data.resultado) {
        alert("✅ Cliente actualizado correctamente");
        formActualizar.reset();
        cargarClientes();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al actualizar cliente"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
      console.error(err);
    }
  });
}

// ========== ELIMINAR CLIENTE ==========
const formEliminar = document.getElementById("formEliminarCliente");
if (formEliminar) {
  formEliminar.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const cedula = document.getElementById("cedulaEliminar").value.trim();
    
    if (!confirm(`¿Está seguro de eliminar el cliente con cédula ${cedula}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/clientes/borrar/${cedula}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ Cliente eliminado correctamente");
        formEliminar.reset();
        cargarClientes();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al eliminar cliente"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
      console.error(err);
    }
  });
}

// ========== BUSCADOR DE CLIENTES ==========
const buscador = document.getElementById("buscadorClientes");
if (buscador) {
  buscador.addEventListener("input", (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaClientes tr");
    
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(busqueda) ? "" : "none";
    });
  });
}

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarClientes();
  
  // Ocultar tabs de modificar y eliminar para cajeros
  const auth = verificarAutenticacion();
  if (auth && auth.perfil === 'cajero') {
    ocultarTab('modificar-tab');
    ocultarTab('eliminar-tab');
  }
});
