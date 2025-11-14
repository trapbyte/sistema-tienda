// Verificar si el usuario está autenticado
function verificarAutenticacion() {
  const usuario = localStorage.getItem('usuario');
  const perfil = localStorage.getItem('perfil');
  
  const paginaActual = window.location.pathname.split('/').pop();
  if (!usuario || !perfil) {
    if (paginaActual !== 'login.html') {
      window.location.href = 'login.html';
    }
    return null;
  }
  
  return { usuario, perfil };
}

// Verificar permisos por página
function verificarPermisos() {
  const auth = verificarAutenticacion();
  if (!auth) return;
  
  const pagina = window.location.pathname.split('/').pop();
  const perfil = auth.perfil;
  
  // Páginas SOLO para administradores
  const paginasAdmin = [
    'proveedores.html',
    'cajeros.html',
    'detalle-compra.html'
  ];
  
  // Si es cajero y está en una página restringida, redirigir
  if (perfil === 'cajero' && paginasAdmin.includes(pagina)) {
    alert('❌ No tienes permisos para acceder a esta página');
    window.location.href = 'index.html';
    return;
  }
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('perfil');
  window.location.href = 'login.html';
}

// Configurar sidebar según perfil
function configurarSidebarPorPerfil(perfil) {
  if (perfil === 'cajero') {
    const elementosOcultar = document.querySelectorAll('[data-admin-only]');
    elementosOcultar.forEach(el => {
      el.style.display = 'none';
    });
  }
  
  const perfilElement = document.getElementById('perfilUsuario');
  if (perfilElement) {
    const label = perfilElement.querySelector('.nav-label');
    if (label) {
      const usuario = localStorage.getItem('usuario');
      label.textContent = `${usuario} (${perfil === 'admin' ? 'Admin' : 'Cajero'})`;
    }
  }
}

// Configurar tabs según perfil y página
function configurarTabsPorPerfil() {
  const auth = verificarAutenticacion();
  if (!auth) return;
  
  const pagina = window.location.pathname.split('/').pop();
  const perfil = auth.perfil;
  
  if (perfil === 'cajero') {
    switch(pagina) {
      case 'clientes.html':
        // Cajero: solo registrar y listar
        ocultarTab('modificar-tab');
        ocultarTab('eliminar-tab');
        break;
      
      case 'productos.html':
        // Cajero: SOLO listar (lectura)
        ocultarTab('registrar-tab');
        ocultarTab('modificar-tab');
        ocultarTab('eliminar-tab');
        break;
      
      case 'categorias.html':
        // Cajero: SOLO listar (lectura)
        ocultarTab('registrar-tab');
        ocultarTab('modificar-tab');
        ocultarTab('eliminar-tab');
        break;
      
      case 'compras.html':
        // Cajero: registrar y listar
        ocultarTab('modificar-tab');
        ocultarTab('eliminar-tab');
        break;
      
      case 'puntos-clientes.html':
        // Cajero: solo ver puntos e historial (NO canjear)
        const canjearBtn = document.querySelector('[data-bs-target="#canjear"]');
        if (canjearBtn && canjearBtn.parentElement) {
          canjearBtn.parentElement.remove();
        }
        break;
    }
  }
}

// Función auxiliar para ocultar tabs
function ocultarTab(tabId) {
  const tab = document.getElementById(tabId);
  if (tab && tab.parentElement) {
    tab.parentElement.remove();
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const auth = verificarAutenticacion();
  if (auth) {
    verificarPermisos();
    configurarSidebarPorPerfil(auth.perfil);
    configurarTabsPorPerfil();
  }
});
