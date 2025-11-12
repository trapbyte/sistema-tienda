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
