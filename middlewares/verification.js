import jwt from 'jsonwebtoken';

const isAdmin = (req, res, next) => {
    // Obtener el token desde las cookies
    const token = req.cookies?.token; // Uso seguro del operador opcional
    console.log('Token recibido:', token);

    if (!token) {
        return res.status(401).json({ 
            status: 'Error', 
            message: 'No autorizado: Token no encontrado' 
        });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, 'your_secret_key');
        console.log('Decoded Token:', decoded);

        // Verificar si la sesión está activa y el usuario tiene el rol de admin
        if (!decoded.role || decoded.role !== 'admin') {
            return res.status(403).json({ 
                status: 'Error', 
                message: 'Acceso prohibido: No tiene permisos de administrador' 
            });
        }

        // Adjuntar los datos decodificados al objeto `req` para su uso posterior
        req.user = decoded;

        // Continuar con la siguiente función o ruta
        next();
    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        return res.status(401).json({ 
            status: 'Error', 
            message: 'Token inválido o expirado' 
        });
    }
};

export default isAdmin;