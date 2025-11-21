window.API_BASE = window.API_BASE || "https://sistema-tienda-c3xf.onrender.com";
//window.API_BASE = window.API_BASE || "http://localhost:3000";

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
    const [productosRes, comprasRes, categoriasRes, detallesRes] = await Promise.all([
      fetch(`${API_BASE}/productos/listar`),
      fetch(`${API_BASE}/compras/listar`),
      fetch(`${API_BASE}/categorias/listar`),
      fetch(`${API_BASE}/detalles-compra/listar`)
    ]);

    const productosData = await productosRes.json();
    const comprasData = await comprasRes.json();
    const categoriasData = await categoriasRes.json();
    const detallesData = await detallesRes.json();

    // Calcular ventas e ingresos del mes actual
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const anioActual = fechaActual.getFullYear();
    
    let ventasMes = 0;
    let ingresosMes = 0;
    
    if (comprasData.resultado && comprasData.resultado.length > 0) {
      comprasData.resultado.forEach(c => {
        const fechaCompra = new Date(c.fec_fac);
        if (fechaCompra.getMonth() === mesActual && fechaCompra.getFullYear() === anioActual) {
          ventasMes++;
          ingresosMes += parseFloat(c.val_tot_fac);
        }
      });
    }

    // Actualizar contadores
    document.getElementById('ventasMes').textContent = ventasMes;
    document.getElementById('ingresosMes').textContent = `$${ingresosMes.toFixed(2)}`;
    document.getElementById('totalProductos').textContent = productosData.resultado?.length || 0;

    // Productos con stock bajo (≤10)
    let productosStockBajo = [];
    if (productosData.resultado && productosData.resultado.length > 0) {
      productosStockBajo = productosData.resultado.filter(p => p.cant_pro <= 10);
    }
    document.getElementById('productosStockBajo').textContent = productosStockBajo.length;

    // Tabla de productos con stock bajo
    const tablaStockBajo = document.getElementById('tablaStockBajo');
    if (productosStockBajo.length > 0) {
      const categoriasMap = {};
      if (categoriasData.resultado) {
        categoriasData.resultado.forEach(cat => {
          categoriasMap[cat.cod_cat] = cat.nom_cat;
        });
      }
      
      tablaStockBajo.innerHTML = productosStockBajo.map(p => `
        <tr class="${p.cant_pro === 0 ? 'table-danger' : p.cant_pro <= 5 ? 'table-warning' : ''}">
          <td>${p.cod_pro}</td>
          <td>${p.nom_pro}</td>
          <td><span class="badge ${p.cant_pro === 0 ? 'bg-danger' : p.cant_pro <= 5 ? 'bg-warning text-dark' : 'bg-secondary'}">${p.cant_pro}</span></td>
          <td>${categoriasMap[p.cod_cat] || 'N/A'}</td>
          <td>$${parseFloat(p.val_pro).toFixed(2)}</td>
        </tr>
      `).join('');
    } else {
      tablaStockBajo.innerHTML = '<tr><td colspan="5" class="text-center text-success">✓ Todos los productos tienen stock suficiente</td></tr>';
    }

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

    // GRÁFICO: Ventas últimos 7 días
    const ventasPorDia = {};
    const labels7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      labels7Dias.push(key);
      ventasPorDia[key] = 0;
    }
    if (comprasData.resultado) {
      comprasData.resultado.forEach(c => {
        const fecha = new Date(c.fec_fac).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        if (ventasPorDia[fecha] !== undefined) {
          ventasPorDia[fecha] += parseFloat(c.val_tot_fac);
        }
      });
    }
    const data7Dias = labels7Dias.map(label => ventasPorDia[label]);

    new Chart(document.getElementById('adminVentas7DiasChart').getContext('2d'), {
      type: 'line',
      data: {
        labels: labels7Dias,
        datasets: [{
          label: 'Ventas ($)',
          data: data7Dias,
          backgroundColor: 'rgba(21, 116, 192, 0.1)',
          borderColor: '#1574c0',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: value => '$' + value.toFixed(0) } }
        }
      }
    });

    // GRÁFICO: Productos por categoría
    const productosPorCategoria = {};
    if (productosData.resultado && categoriasData.resultado) {
      categoriasData.resultado.forEach(cat => {
        productosPorCategoria[cat.nom_cat] = 0;
      });
      productosData.resultado.forEach(p => {
        const cat = categoriasData.resultado.find(c => c.cod_cat == p.cod_cat);
        if (cat) {
          productosPorCategoria[cat.nom_cat]++;
        }
      });
    }

    new Chart(document.getElementById('adminProductosCategoriaChart').getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(productosPorCategoria),
        datasets: [{
          data: Object.values(productosPorCategoria),
          backgroundColor: ['#1574c0', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14']
        }]
      },
      options: {
        responsive: true,
        plugins: { 
          legend: { position: 'bottom' }
        }
      }
    });

    // GRÁFICO: Top 5 productos más vendidos
    const ventasPorProducto = {};
    if (detallesData.resultado) {
      detallesData.resultado.forEach(d => {
        if (!ventasPorProducto[d.cod_pro]) {
          ventasPorProducto[d.cod_pro] = { cantidad: 0, nombre: '' };
        }
        ventasPorProducto[d.cod_pro].cantidad += parseInt(d.cant_pro);
      });
      // Obtener nombres de productos
      if (productosData.resultado) {
        Object.keys(ventasPorProducto).forEach(cod => {
          const prod = productosData.resultado.find(p => p.cod_pro == cod);
          if (prod) {
            ventasPorProducto[cod].nombre = prod.nom_pro;
          }
        });
      }
    }

    const topProductos = Object.entries(ventasPorProducto)
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .slice(0, 5);

    new Chart(document.getElementById('adminTopProductosChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: topProductos.map(([cod, data]) => data.nombre || cod),
        datasets: [{
          label: 'Unidades Vendidas',
          data: topProductos.map(([cod, data]) => data.cantidad),
          backgroundColor: '#28a745'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } }
      }
    });

    // GRÁFICO: Top 10 productos menos vendidos
    // Primero, agregar productos que no se han vendido con cantidad 0
    if (productosData.resultado) {
      productosData.resultado.forEach(p => {
        if (!ventasPorProducto[p.cod_pro]) {
          ventasPorProducto[p.cod_pro] = { cantidad: 0, nombre: p.nom_pro };
        }
      });
    }

    const productosMenosVendidos = Object.entries(ventasPorProducto)
      .sort((a, b) => a[1].cantidad - b[1].cantidad)
      .slice(0, 10);

    console.log('Productos menos vendidos:', productosMenosVendidos);

    const containerMenosVendidos = document.getElementById('menosVendidosContainer');
    
    if (productosMenosVendidos.length > 0) {
      new Chart(document.getElementById('adminProductosMenosVendidosChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: productosMenosVendidos.map(([cod, data]) => {
            const nombre = data.nombre || cod;
            // Truncar nombres largos
            return nombre.length > 20 ? nombre.substring(0, 20) + '...' : nombre;
          }),
          datasets: [{
            label: 'Unidades Vendidas',
            data: productosMenosVendidos.map(([cod, data]) => data.cantidad),
            backgroundColor: '#dc3545'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function(context) {
                  const index = context[0].dataIndex;
                  return productosMenosVendidos[index][1].nombre || productosMenosVendidos[index][0];
                },
                label: function(context) {
                  return 'Vendidas: ' + context.parsed.y + ' unidades';
                }
              }
            }
          },
          scales: { 
            y: { 
              beginAtZero: true, 
              ticks: { stepSize: 1 },
              title: { display: true, text: 'Unidades Vendidas' }
            },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            }
          }
        }
      });
    } else {
      containerMenosVendidos.innerHTML = '<p class="text-center text-muted">No hay datos de ventas disponibles</p>';
    }

  } catch (err) {
    console.error('Error al cargar dashboard:', err);
  }
}

// Dashboard para CAJERO
async function cargarDashboardCajero() {
  try {
    // Traer compras, productos y detalles
    const [comprasRes, productosRes, detallesRes] = await Promise.all([
      fetch(`${API_BASE}/compras/listar`),
      fetch(`${API_BASE}/productos/listar`),
      fetch(`${API_BASE}/detalles-compra/listar`)
    ]);
    const comprasData = await comprasRes.json();
    const productosData = await productosRes.json();
    const detallesData = await detallesRes.json();

    // --- Ventas y ganancias de hoy ---
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    let ventasHoy = 0;
    let gananciasHoy = 0;
    let ultimasCompras = [];
    let comprasHoyDetalladas = [];

    if (comprasData.resultado && comprasData.resultado.length > 0) {
      // Filtrar compras de hoy
      const comprasHoy = comprasData.resultado.filter(c => {
        const fecha = new Date(c.fec_fac);
        return fecha >= hoy;
      });
      ventasHoy = comprasHoy.length;
      gananciasHoy = comprasHoy.reduce((sum, c) => sum + parseFloat(c.val_tot_fac), 0);
      comprasHoyDetalladas = comprasHoy;

      // Últimas 5 compras (todas)
      ultimasCompras = comprasData.resultado.slice(-5).reverse();
    }

    document.getElementById('cajeroVentasHoy').textContent = ventasHoy;
    document.getElementById('cajeroGananciasHoy').textContent = `$${gananciasHoy.toFixed(2)}`;

    // --- Productos bajo stock ---
    let bajoStock = [];
    if (productosData.resultado && productosData.resultado.length > 0) {
      bajoStock = productosData.resultado.filter(p => p.cant_pro <= 10);
    }
    document.getElementById('cajeroBajoStock').textContent = bajoStock.length;

    // --- Tabla de productos con stock bajo ---
    const cajeroTablaStockBajo = document.getElementById('cajeroTablaStockBajo');
    if (bajoStock.length > 0) {
      cajeroTablaStockBajo.innerHTML = bajoStock.map(p => `
        <tr class="${p.cant_pro === 0 ? 'table-danger' : p.cant_pro <= 5 ? 'table-warning' : ''}">
          <td>${p.cod_pro}</td>
          <td>${p.nom_pro}</td>
          <td><span class="badge ${p.cant_pro === 0 ? 'bg-danger' : p.cant_pro <= 5 ? 'bg-warning text-dark' : 'bg-secondary'}">${p.cant_pro}</span></td>
          <td>$${parseFloat(p.val_pro).toFixed(2)}</td>
        </tr>
      `).join('');
    } else {
      cajeroTablaStockBajo.innerHTML = '<tr><td colspan="4" class="text-center text-success">✓ Todos los productos tienen stock suficiente</td></tr>';
    }

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

    // GRÁFICO: Ventas de hoy por hora
    const ventasPorHora = {};
    for (let h = 0; h < 24; h++) {
      ventasPorHora[h] = 0;
    }
    if (comprasHoyDetalladas.length > 0) {
      comprasHoyDetalladas.forEach(c => {
        const hora = new Date(c.fec_fac).getHours();
        ventasPorHora[hora] += parseFloat(c.val_tot_fac);
      });
    }
    
    // Filtrar solo horas con actividad o cercanas
    const horasActivas = Object.keys(ventasPorHora).filter(h => ventasPorHora[h] > 0);
    let horaMin = horasActivas.length > 0 ? Math.max(0, Math.min(...horasActivas) - 1) : 8;
    let horaMax = horasActivas.length > 0 ? Math.min(23, Math.max(...horasActivas) + 1) : 18;
    
    const horasLabels = [];
    const horasData = [];
    for (let h = horaMin; h <= horaMax; h++) {
      horasLabels.push(`${h}:00`);
      horasData.push(ventasPorHora[h]);
    }

    new Chart(document.getElementById('cajeroVentasHoyChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: horasLabels,
        datasets: [{
          label: 'Ventas ($)',
          data: horasData,
          backgroundColor: '#1574c0'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: value => '$' + value.toFixed(0) } }
        }
      }
    });

    // GRÁFICO: Top 5 productos vendidos hoy
    const ventasProductosHoy = {};
    if (detallesData.resultado && comprasHoyDetalladas.length > 0) {
      const facturasHoy = comprasHoyDetalladas.map(c => c.nro_fac);
      detallesData.resultado.forEach(d => {
        if (facturasHoy.includes(d.nro_fac)) {
          if (!ventasProductosHoy[d.cod_pro]) {
            ventasProductosHoy[d.cod_pro] = { cantidad: 0, nombre: '' };
          }
          ventasProductosHoy[d.cod_pro].cantidad += parseInt(d.cant_pro);
        }
      });
      // Obtener nombres
      if (productosData.resultado) {
        Object.keys(ventasProductosHoy).forEach(cod => {
          const prod = productosData.resultado.find(p => p.cod_pro == cod);
          if (prod) {
            ventasProductosHoy[cod].nombre = prod.nom_pro;
          }
        });
      }
    }

    const topProductosHoy = Object.entries(ventasProductosHoy)
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .slice(0, 5);

    if (topProductosHoy.length > 0) {
      new Chart(document.getElementById('cajeroTopProductosChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: topProductosHoy.map(([cod, data]) => data.nombre || cod),
          datasets: [{
            label: 'Unidades',
            data: topProductosHoy.map(([cod, data]) => data.cantidad),
            backgroundColor: '#28a745'
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true } }
        }
      });
    } else {
      // Mostrar mensaje si no hay ventas hoy
      const ctx = document.getElementById('cajeroTopProductosChart').getContext('2d');
      ctx.font = '14px Arial';
      ctx.fillStyle = '#6c757d';
      ctx.textAlign = 'center';
      ctx.fillText('No hay ventas hoy', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

  } catch (err) {
    console.error('Error al cargar dashboard cajero:', err);
  }
}
