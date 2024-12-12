document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const messageError = document.querySelector('.error');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, email, password })
        });

        // Si la respuesta no es exitosa, mostrar el mensaje de error
        if (!res.ok) {
            const resJson = await res.json();
            // Mostrar el mensaje en el DOM
            if (messageError) {
                messageError.classList.remove('hidden');
                messageError.textContent = resJson.message || "Error al iniciar sesión. Inténtalo de nuevo.";
            }
            // Mostrar una alerta con el mensaje de error
            alert(resJson.message || "Error al iniciar sesión. Inténtalo de nuevo.");
            return;
        }

        const resJson = await res.json();
        alert(resJson.message);

        if (resJson.redirect) {
            // Guardar el token en el localStorage
            localStorage.setItem('token', resJson.token);
            localStorage.setItem('user', resJson.user); // Guardamos el nombre de usuario
            window.location.href = resJson.redirect; // Redirigir a shop.html
        }
    } catch (err) {
        console.error('Error en el servidor:', err);
        // Mostrar el mensaje de error en el DOM
        if (messageError) {
            messageError.classList.remove('hidden');
            messageError.textContent = "Hubo un error en el servidor.";
        }
        // Mostrar una alerta en caso de error
        alert("Hubo un error en el servidor.");
    }
});

// Función para actualizar la barra de navegación al iniciar sesión
function updateNavBar(userName) {
    const loginButtons = document.querySelector('.login-buttons');
    if (!loginButtons) {
        console.error('Elemento ".login-buttons" no encontrado.');
        return;
    }

    // Limpiar contenido actual
    loginButtons.innerHTML = '';

    // Crear botón "Bienvenido"
    const welcomeButton = document.createElement('button');
    welcomeButton.textContent = `Bienvenido, ${userName}`;
    welcomeButton.classList.add('dropdown-button');

    // Crear menú desplegable
    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dropdown-menu');
    dropdownMenu.innerHTML = `
        <button id="logout-button">Cerrar Sesión</button>
    `;

    // Añadir eventos
    welcomeButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show'); // Alternar visibilidad del menú
    });

    const logoutButton = dropdownMenu.querySelector('#logout-button');
    logoutButton.addEventListener('click', () => {
        console.log('Cerrando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload(); // Recargar la página para reflejar el cambio
    });

    // Añadir elementos a la barra de navegación
    loginButtons.appendChild(welcomeButton);
    loginButtons.appendChild(dropdownMenu);
}