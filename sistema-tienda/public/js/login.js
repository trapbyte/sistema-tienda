const API_BASE = "http://localhost:3000";
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.resultado) {
      // Guardar datos del usuario en localStorage
      localStorage.setItem('usuario', data.resultado.nombre);
      localStorage.setItem('perfil', data.resultado.rol);
      localStorage.setItem('email', data.resultado.email);
      localStorage.setItem('id_usuario', data.resultado.id_usuario);
      
      // Redirigir al dashboard
      window.location.href = 'index.html';
    } else {
      alert('❌ ' + (data.mensaje || 'Error al iniciar sesión'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión con el servidor');
  }
});
