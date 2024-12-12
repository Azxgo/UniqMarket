document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No has iniciado sesión.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch('/api/auth/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Error al obtener los datos del usuario.');

        const user = await res.json();
        document.getElementById('user').value = user.name;
        document.getElementById('email').value = user.email;
    } catch (err) {
        console.error(err);
        alert('Error al cargar los datos del usuario.');
        window.location.href = '/index.html';
    }
});
