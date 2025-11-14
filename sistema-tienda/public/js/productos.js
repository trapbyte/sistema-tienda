const API_BASE = "http://localhost:3000";

// Sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('sidebar-collapsed');
  sidebar.classList.toggle('sidebar-expanded');
}

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.add('sidebar-expanded');
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleSidebar);
    }
  }

  // Cargar dashboard si estamos en index.html
  if (document.getElementById('main-content')) {
    cargarDashboard();
  }
});

// Función para cargar dashboard
async function cargarDashboard() {
  try {
    // Cargar totales
    const [clientesRes, productosRes, comprasRes, proveedoresRes] = await Promise.all([
      fetch(`${API_BASE}/clientes/listar`),
      fetch(`${API_BASE}/productos/listar`),
      fetch(`${API_BASE}/compras/listar`),
      fetch(`${API_BASE}/proveedores/listar`)
    ]);

    const clientesData = await clientesRes.json();
    const productosData = await productosRes.json();
    const comprasData = await comprasRes.json();
    const proveedoresData = await proveedoresRes.json();

    // Actualizar contadores
    document.getElementById('totalClientes').textContent = clientesData.resultado?.length || 0;
    document.getElementById('totalProductos').textContent = productosData.resultado?.length || 0;
    document.getElementById('totalCompras').textContent = comprasData.resultado?.length || 0;
    document.getElementById('totalProveedores').textContent = proveedoresData.resultado?.length || 0;

    // Cargar últimas compras
    if (comprasData.resultado && comprasData.resultado.length > 0) {
      const ultimasCompras = comprasData.resultado.slice(-5).reverse();
      const tablaUltimasCompras = document.getElementById('tablaUltimasCompras');
      tablaUltimasCompras.innerHTML = ultimasCompras.map(c => `
        <tr>
          <td>${c.nro_fac}</td>
          <td>${c.ide_cli}</td>
          <td>$${parseFloat(c.val_tot_fac).toFixed(2)}</td>
          <td>${new Date(c.fec_fac).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar dashboard:', err);
  }
}

// ========== CARGAR LISTA DE PRODUCTOS ==========
async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos/listar`);
    const data = await res.json();
    const tabla = document.getElementById("tablaProductos");
    if (data.resultado && data.resultado.length > 0) {
      tabla.innerHTML = data.resultado
        .map((p) => {
          let desc = p.descripcion || '';
          if (desc.length > 40) desc = desc.substring(0, 40) + '...';
          return `
          <tr>
            <td>${p.cod_pro}</td>
            <td>${p.nom_pro}</td>
            <td>${desc}</td>
            <td>${p.val_pro}</td>
            <td>${p.cant_pro}</td>
            <td>${p.cod_cat || ''}</td>
          </tr>
        `;
        })
        .join("");
    } else {
      tabla.innerHTML = '<tr><td colspan="6" class="text-center">No hay productos registrados</td></tr>';
    }
  } catch (err) {
    document.getElementById("tablaProductos").innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar productos</td></tr>';
  }
}

// ========== REGISTRAR PRODUCTO ==========
const formProducto = document.getElementById("formProducto");
if (formProducto) {
  formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const producto = {
      cod_pro: document.getElementById("codigoProducto").value.trim(),
      nom_pro: document.getElementById("nombreProducto").value.trim(),
      descripcion: document.getElementById("descripcionProducto")?.value.trim() || "",
      val_pro: document.getElementById("precioProducto").value.trim(),
      cant_pro: document.getElementById("stockProducto").value.trim(),
      cod_cat: document.getElementById("categoriaProducto").value,
      fec_ven_pro: document.getElementById("fechaVencimientoProducto").value,
    };
    try {
      const res = await fetch(`${API_BASE}/productos/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Producto registrado correctamente");
        formProducto.reset();
        cargarProductos();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al registrar producto"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== BUSCADOR DE PRODUCTOS ==========
const buscador = document.getElementById("buscadorProductos");
if (buscador) {
  buscador.addEventListener("input", (e) => {
    const busqueda = e.target.value.toLowerCase();
    const filas = document.querySelectorAll("#tablaProductos tr");
    filas.forEach(fila => {
      const texto = fila.textContent.toLowerCase();
      fila.style.display = texto.includes(busqueda) ? "" : "none";
    });
  });
}

// ========== CARGAR CATEGORÍAS EN EL DROPDOWN ==========
async function cargarCategoriasDropdown() {
  try {
    const res = await fetch(`${API_BASE}/categorias/listar`);
    const data = await res.json();
    const selects = [
      document.getElementById("categoriaProducto"),
      document.getElementById("categoriaActualizar")
    ];
    selects.forEach(select => {
      if (select && data.resultado) {
        select.innerHTML = '<option value="">Seleccione una categoría</option>' +
          data.resultado.map(cat =>
            `<option value="${cat.cod_cat}">${cat.nom_cat}</option>`
          ).join('');
      }
    });
  } catch (err) {
    const selects = [
      document.getElementById("categoriaProducto"),
      document.getElementById("categoriaActualizar")
    ];
    selects.forEach(select => {
      if (select) select.innerHTML = '<option value="">Seleccione una categoría</option>';
    });
  }
}

// ========== MODIFICAR PRODUCTO ==========
const formActualizarProducto = document.getElementById("formActualizarProducto");
if (formActualizarProducto) {
  formActualizarProducto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigoActualizar").value.trim();
    const producto = {
      nom_pro: document.getElementById("nombreActualizar").value.trim(),
      descripcion: document.getElementById("descripcionActualizar")?.value.trim() || "",
      val_pro: document.getElementById("precioActualizar").value.trim(),
      cant_pro: document.getElementById("stockActualizar").value.trim(),
      cod_cat: document.getElementById("categoriaActualizar").value,
      fec_ven_pro: document.getElementById("fechaVencimientoActualizar").value,
    };
    try {
      const res = await fetch(`${API_BASE}/productos/actualizar/${codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
      const data = await res.json();
      if (data.resultado) {
        alert("✅ Producto actualizado correctamente");
        formActualizarProducto.reset();
        cargarProductos();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al actualizar producto"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== ELIMINAR PRODUCTO ==========
const formEliminarProducto = document.getElementById("formEliminarProducto");
if (formEliminarProducto) {
  formEliminarProducto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigoEliminar").value.trim();
    if (!codigo) {
      alert("❌ Debe ingresar el código del producto");
      return;
    }
    if (!confirm(`¿Está seguro de eliminar el producto con código ${codigo}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/productos/borrar/${codigo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Producto eliminado correctamente");
        formEliminarProducto.reset();
        cargarProductos();
        const listarTab = document.getElementById("listar-tab");
        if (listarTab) {
          const tab = new bootstrap.Tab(listarTab);
          tab.show();
        }
      } else {
        alert("❌ " + (data.mensaje || "Error al eliminar producto"));
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

// ========== CARGAR DATOS AL INICIAR ==========
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarCategoriasDropdown();
});