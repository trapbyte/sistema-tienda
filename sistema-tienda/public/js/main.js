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

  // Mostrar usuario logueado
  const auth = verificarAutenticacion();
  if (auth) {
    const perfilElement = document.getElementById('perfilUsuario');
    if (perfilElement) {
      const label = perfilElement.querySelector('.nav-label');
      if (label) {
        label.textContent = `${auth.usuario} (${auth.perfil})`;
      }
    }
    // Mostrar dashboard según perfil
    const adminDashboard = document.getElementById('admin-dashboard');
    const cajeroDashboard = document.getElementById('cajero-dashboard');
    if (auth.perfil === 'cajero') {
      if (adminDashboard) adminDashboard.style.display = 'none';
      if (cajeroDashboard) {
        cajeroDashboard.style.display = '';
        cargarDashboardCajero();
      }
    } else {
      if (adminDashboard) adminDashboard.style.display = '';
      if (cajeroDashboard) cajeroDashboard.style.display = 'none';
      cargarDashboard();
    }
  }

  // Cargar dashboard si estamos en index.html y no es cajero
  if (document.getElementById('main-content')) {
    const auth = verificarAutenticacion();
    if (!auth || auth.perfil !== 'cajero') {
      cargarDashboard();
    }
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

// Dashboard para CAJERO
async function cargarDashboardCajero() {
  try {
    // Traer compras y productos
    const [comprasRes, productosRes] = await Promise.all([
      fetch(`${API_BASE}/compras/listar`),
      fetch(`${API_BASE}/productos/listar`)
    ]);
    const comprasData = await comprasRes.json();
    const productosData = await productosRes.json();

    // --- Ventas y ganancias de hoy ---
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    let ventasHoy = 0;
    let gananciasHoy = 0;
    let ultimasCompras = [];

    if (comprasData.resultado && comprasData.resultado.length > 0) {
      // Filtrar compras de hoy
      const comprasHoy = comprasData.resultado.filter(c => {
        const fecha = new Date(c.fec_fac);
        return fecha >= hoy;
      });
      ventasHoy = comprasHoy.length;
      gananciasHoy = comprasHoy.reduce((sum, c) => sum + parseFloat(c.val_tot_fac), 0);

      // Últimas 5 compras (todas)
      ultimasCompras = comprasData.resultado.slice(-5).reverse();
    }

    document.getElementById('cajeroVentasHoy').textContent = ventasHoy;
    document.getElementById('cajeroGananciasHoy').textContent = `$${gananciasHoy.toFixed(2)}`;

    // --- Productos bajo stock ---
    let bajoStock = [];
    if (productosData.resultado && productosData.resultado.length > 0) {
      bajoStock = productosData.resultado.filter(p => p.cant_pro <= 5);
    }
    document.getElementById('cajeroBajoStock').textContent = bajoStock.length;

    // --- Tabla últimas compras ---
    const tablaUltimas = document.getElementById('cajeroUltimasCompras');
    if (tablaUltimas) {
      tablaUltimas.innerHTML = ultimasCompras.map(c => `
        <tr>
          <td>${c.nro_fac}</td>
          <td>${c.ide_cli}</td>
          <td>$${parseFloat(c.val_tot_fac).toFixed(2)}</td>
          <td>${new Date(c.fec_fac).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }

    // --- Gráfico ventas últimos 7 días ---
    const ventasPorDia = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString();
      ventasPorDia[key] = 0;
    }
    if (comprasData.resultado) {
      comprasData.resultado.forEach(c => {
        const fecha = new Date(c.fec_fac).toLocaleDateString();
        if (ventasPorDia[fecha] !== undefined) {
          ventasPorDia[fecha] += parseFloat(c.val_tot_fac);
        }
      });
    }
    const labels = Object.keys(ventasPorDia);
    const data = Object.values(ventasPorDia);

    const ctxVentas = document.getElementById('cajeroVentasSemanaChart').getContext('2d');
    new Chart(ctxVentas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ventas ($)',
          data,
          backgroundColor: '#1574c0'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    // --- Gráfico productos bajo stock ---
    const ctxStock = document.getElementById('cajeroBajoStockChart').getContext('2d');
    new Chart(ctxStock, {
      type: 'pie',
      data: {
        labels: bajoStock.map(p => p.nom_pro),
        datasets: [{
          data: bajoStock.map(p => p.cant_pro),
          backgroundColor: bajoStock.map(() => '#e74c3c')
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: false }
        }
      }
    });

  } catch (err) {
    console.error('Error al cargar dashboard cajero:', err);
  }
}
