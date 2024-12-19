import bcryptjs from 'bcryptjs'; 
import connection from '../database.js'; 
import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { user, email, password } = req.body;

    if (!user || !email || !password) {
        return res.status(400).json({ status: "Error", message: "Los campos están incompletos" });
    }

    try {
        const [userData] = await connection.execute(
            "SELECT * FROM users WHERE name = ? OR email = ?",
            [user, email]
        );

        if (userData.length === 0) {
            return res.status(400).json({ status: "Error", message: "El usuario o correo no existe" });
        }

        const isMatch = await bcryptjs.compare(password, userData[0].password);
        if (!isMatch) {
            return res.status(400).json({ status: "Error", message: "Contraseña incorrecta" });
        }

        // Generar el JWT
        const token = jwt.sign(
            {
                userId: userData[0].user_id,
                role: userData[0].role
            },
            'your_secret_key',
            { expiresIn: '1h' }
        );

        console.log('Generated Token:', token);

        // Establecer el token en una cookie
        res.cookie('token', token, {
            httpOnly: true,  // No accesible desde JavaScript
            secure: process.env.NODE_ENV === 'production', // Solo si es producción
            expires: new Date(Date.now() + 3600000) // Expira en 1 hora
        });

        // Determinar la redirección según el rol
        let redirectUrl = "/shop.html";
        if (userData[0].role === "admin") {
            redirectUrl = "/admin";
        }

        return res.status(200).json({
            status: "ok",
            message: "Inicio de sesión exitoso",
            redirect: redirectUrl,
            user: userData[0].name
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: "Error en el servidor" });
    }
};
export const register = async (req, res) => {
    const { user, email, password } = req.body;

    // Validación de campos
    if (!user || !email || !password) {
        return res.status(400).json({ status: "Error", message: "Los campos están incompletos" });
    }

    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await connection.execute(  
            "SELECT * FROM users WHERE name = ? OR email = ?",
            [user, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ status: "Error", message: "El usuario o correo ya existen" });
        }

        // Hashear la contraseña
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Insertar el usuario en la base de datos
        await connection.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [user, email, hashedPassword]
        );

        return res.status(201).json({ status: "ok", message: "Usuario registrado correctamente", redirect: "/" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: "Error en el servidor" });
    }
};
export const deleteUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'Error', message: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        console.log('Token decodificado:', decoded);
        const userId = decoded.userId || null;

        if (!userId) {
            return res.status(400).json({ status: 'Error', message: 'ID de usuario inválido' });
        }

        const [result] = await connection.execute('DELETE FROM users WHERE user_id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'Error', message: 'Usuario no encontrado' });
        }

        return res.status(200).json({ status: 'ok', message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'Error', message: 'Error al eliminar el usuario' });
    }
};

export const updateUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { user, email, password } = req.body;

    if (!token) return res.status(401).json({ message: 'No autorizado.' });

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        const userId = decoded.userId; 

        const fields = [];
        const params = [];
        if (user) {
            fields.push('name = ?');
            params.push(user);
        }
        if (email) {
            fields.push('email = ?');
            params.push(email);
        }
        if (password) {
            const hashedPassword = await bcryptjs.hash(password, 10);
            fields.push('password = ?');
            params.push(hashedPassword);
        }
        if (fields.length === 0) {
            return res.status(400).json({ message: 'No se enviaron datos para actualizar.' });
        }

        params.push(userId);
        await connection.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, // Usar `id` en lugar de `name`
            params
        );

        // Generar un nuevo token si el nombre fue actualizado
        const [updatedUser] = await connection.execute(
            "SELECT * FROM users WHERE user_id = ?",
            [userId]
        );

        const newToken = jwt.sign(
            { userId: updatedUser[0].id, username: updatedUser[0].name },
            'your_secret_key',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Usuario actualizado correctamente.',
            token: newToken, // Enviar el nuevo token al cliente
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar el usuario.' });
    }
};

export const getUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: 'Error', message: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        const [userData] = await connection.execute(
            "SELECT name, email FROM users WHERE user_id = ?",
            [decoded.userId]
        );

        if (userData.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Usuario no encontrado' });
        }

        res.status(200).json(userData[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'Error', message: 'Error al obtener los datos del usuario' });
    }
};