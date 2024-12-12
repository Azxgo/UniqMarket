const messageError = document.querySelector('.error');

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (messageError) {
        messageError.classList.add('hidden');
    }

    const user = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, email, password })
        });

        // Si la respuesta no es exitosa, mostrar el mensaje de error
        if (!res.ok) {
            const errorData = await res.json(); // Leer el cuerpo de la respuesta
            console.log('Error en la respuesta del servidor:', errorData); // Para depuración

            // Mostrar el mensaje en el DOM
            if (messageError) {
                messageError.classList.remove('hidden');
                messageError.textContent = errorData.message || "Error desconocido. Inténtalo de nuevo."; // Usar el mensaje del servidor o un mensaje genérico
            }

            // Mostrar una alerta 
            alert(errorData.message || "Error desconocido. Inténtalo de nuevo.");

            return;
        }

        const resJson = await res.json();
        alert(resJson.message);
        if (resJson.redirect) {
            window.location.href = resJson.redirect;
        }
    } catch (err) {
        console.error(err);
        // En caso de un error en la conexión o en el servidor
        if (messageError) {
            messageError.classList.remove('hidden');
            messageError.textContent = "Hubo un error en el servidor. Inténtalo más tarde.";
        }
        
        // Mostrar una alerta
        alert("Hubo un error en el servidor. Inténtalo más tarde.");
    }
});