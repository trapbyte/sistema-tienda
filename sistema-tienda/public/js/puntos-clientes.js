window.API_BASE = window.API_BASE || "https://sistema-tienda-c3xf.onrender.com";
//const API_BASE = "http://localhost:3000";

async function cargarPuntosClientes() {
  try {
    const res = await fetch(`${API_BASE}/puntos-clientes/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaPuntosClientes");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado.map(p => {
        const cliente = p.Cliente || p.cliente || {};
        return `
          <tr>
            <td>${cliente.nom_cli || p.ide_cli}</td>
            <td><span class="badge bg-success">${p.puntos_actual}</span></td>
            <td>${p.puntos_totales_obtenidos}</td>
            <td>${p.puntos_totales_canjeados}</td>
            <td>${new Date(p.ultima_actualizacion).toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    } else {
      tabla.innerHTML = '<tr><td colspan="5" class="text-center">No hay puntos registrados</td></tr>';
    }
  } catch (err) {
    tabla.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar puntos</td></tr>';
  }
}

async function cargarDetallePuntos() {
  try {
    const res = await fetch(`${API_BASE}/puntos-clientes/detalle`);
    const data = await res.json();
    const tabla = document.getElementById("tablaDetallePuntos");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado.map(d => {
        const cliente = d.Cliente || d.cliente || {};
        return `
          <tr>
            <td>${cliente.nom_cli || d.ide_cli}</td>
            <td><span class="badge ${d.tipo_movimiento === 'GANANCIA' ? 'bg-success' : 'bg-danger'}">${d.tipo_movimiento}</span></td>
            <td>${d.puntos}</td>
            <td>${d.descripcion || ''}</td>
            <td>${new Date(d.fecha).toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    } else {
      tabla.innerHTML = '<tr><td colspan="5" class="text-center">No hay movimientos registrados</td></tr>';
    }
  } catch (err) {
    tabla.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar historial</td></tr>';
  }
}

const formCanjearPuntos = document.getElementById("formCanjearPuntos");
if (formCanjearPuntos) {
  formCanjearPuntos.addEventListener("submit", async (e) => {
    e.preventDefault();
    const canje = {
      ide_cli: document.getElementById("clienteCanjear").value.trim(),
      puntos_a_canjear: parseInt(document.getElementById("puntosCanjear").value),
      descripcion: document.getElementById("descripcionCanje").value.trim()
    };
    try {
      const res = await fetch(`${API_BASE}/puntos-clientes/canjear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(canje),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Puntos canjeados correctamente");
        formCanjearPuntos.reset();
        cargarPuntosClientes();
        cargarDetallePuntos();
      } else {
        alert("❌ " + (data.mensaje || "Error al canjear puntos"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPuntosClientes();
  cargarDetallePuntos();
  
  // Ocultar tab de canjear para cajeros (solo admin puede canjear)
  const auth = verificarAutenticacion();
  if (auth && auth.perfil === 'cajero') {
    const canjearBtn = document.querySelector('[data-bs-target="#canjear"]');
    if (canjearBtn && canjearBtn.parentElement) {
      canjearBtn.parentElement.remove();
    }
  }
});
