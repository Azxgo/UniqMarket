import jwt from 'jsonwebtoken';

const isAdmin = (req, res, next) => {
    // Obtener el token desde las cookies
    const token = req.cookies.token;
    console.log('Token recibido:', token);

    if (!token) {
        return res.status(401).json({ status: 'Error', message: 'No autorizado: Token no encontrado' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, 'your_secret_key');
        console.log('Decoded Token:', decoded);

        // Verificar si el rol es 'admin'
        if (decoded.role !== 'admin') {
            return res.status(403).json({ status: 'Error', message: 'Acceso prohibido: No tiene permisos de administrador' });
        }

        // Si es admin, continuar con la siguiente función (ruta)
        next();
    } catch (err) {
        console.error('Error al verificar el token:', err);
        return res.status(500).json({ status: 'Error', message: 'Error al verificar el token' });
    }
};

export default isAdmin;