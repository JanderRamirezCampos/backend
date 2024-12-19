import { promisify } from 'util';
import { error } from 'console';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import conexion from '../database/db.js'; // Asegúrate de importar tu conexión a la base de datos
import enviarCorreoAceptado from '../controllers/mail.service.js';
dotenv.config({ path: './env/.env' });  // Asegúrate de que la ruta es correcta

// Login por Google

// Configuración de Google Strategy para autenticación

export const googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email']
});

export const googleCallback = passport.authenticate('google', {
    successRedirect: '/admin/index',
    failureRedirect: '/auth/login',
});
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            passReqToCallback: true
        },
        function (request, accessToken, refreshToken, profile, done) {
            User.findOrCreate({ googleId: profile.id }, function (err, user) {
                return done(err, user);
            });
        }

    )
);
export const googleLoginVerify = (req, res) => {
    console.log('Token recibido:', req.body.token);  // Verifica si el token llega al servidor
    res.send({ message: 'Autenticación con Google exitosa' });
};

// Función de autenticación por correo y contraseña
export const auth = async (req, res) => {
    const { user, pass } = req.body;

    // Validar que se proporcionen ambos campos
    if (!user || !pass) {
        return res.status(400).json({
            success: false,
            message: "Por favor ingresa un usuario y/o contraseña",
        });
    }

    try {
        // Consultar la base de datos para verificar si el usuario existe
        conexion.query('SELECT * FROM sexpediente.users WHERE user = ?', [user], async (err, results) => {
            if (err) {
                console.error('Error en la base de datos:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al verificar el usuario en la base de datos',
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario y/o contraseña incorrectos',
                });
            }

            const userRecord = results[0];

            // Validar la contraseña
            const isPasswordValid = await bcryptjs.compare(pass, userRecord.pass);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario y/o contraseña incorrectos',
                });
            }

            // Generar el token JWT
            const token = jwt.sign({ id: userRecord.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRATION,
            });
            console.log('Token JWT generado:', token);

            const query = 'SELECT * FROM sexpediente.users WHERE id = ?';
            conexion.execute(query, [userRecord.id], (err, results) => {
                if (err) {
                    console.error('Error al realizar la consulta:', err);
                } else {
                    const userWithName = results[0];
                    console.log(userWithName);
                    req.session.user = userWithName.user;
                }
            });

            req.session.loggedin = true;

            // Configurar la cookie segura para el token JWT
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000, // Expira en 1 día
            });

            return res.status(200).json({
                success: true,
                message: 'Usuario autenticado correctamente',
                token,
                userId: userRecord.id,
                userName: userRecord.user,
            });
        });
    } catch (error) {
        console.error('Error en la autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en la autenticación',
        });
    }
};



// Registro de usuario
export const register = async (req, res) => {
    const { user, pass, nombres, apellidos, correo, telefono } = req.body;

    try {
        const passwordHash = await bcryptjs.hash(pass, 8);

        const query = 'INSERT INTO sexpediente.users SET ?';
        const values = {
            user,
            pass: passwordHash,
            nombres,
            apellidos,
            correo,
            telefono
        };

        conexion.query(query, values, async (error, results) => {
            if (error) {
                console.error('Error al registrar usuario:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al registrar el usuario',
                });
            }

            // Enviar correo de aceptación
            const correoRespuesta = await enviarCorreoAceptado(req);
            console.log(correoRespuesta);

            return res.status(201).json({
                success: true,
                message: 'Usuario registrado correctamente',
            });
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el registro',
        });
    }
};

// Eliminar usuario
export const eliminarUsuario = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'El ID del usuario es requerido',
        });
    }

    const query = 'DELETE FROM sexpediente.users WHERE id = ?';
    conexion.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar el usuario',
            });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado correctamente',
        });
    });
};

// Editar usuario
export const editarUsuario = async (req, res) => {
    const { id } = req.params;
    const { user, pass, nombres, apellidos, correo, telefono } = req.body;

    try {
        conexion.query('SELECT pass FROM sexpediente.users WHERE id = ?', [id], async (error, results) => {
            if (error) {
                console.error('Error al obtener la contraseña actual:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener la información del usuario',
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                });
            }

            const currentPassword = results[0].pass;
            let hashedPassword;

            if (pass && pass !== currentPassword) {
                hashedPassword = await bcryptjs.hash(pass, 8);
            } else {
                hashedPassword = currentPassword;
            }

            const query = `UPDATE sexpediente.users 
                           SET user = ?, pass = ?, nombres = ?, apellidos = ?, correo = ?, telefono = ? 
                           WHERE id = ?`;
            const values = [user, hashedPassword, nombres, apellidos, correo, telefono, id];

            conexion.query(query, values, (updateError, updateResults) => {
                if (updateError) {
                    console.error('Error al editar usuario:', updateError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al editar el usuario',
                    });
                }

                if (updateResults.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado',
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Usuario editado correctamente',
                });
            });
        });
    } catch (error) {
        console.error('Error en editarUsuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en editarUsuario',
        });
    }
};

// Listar todos los usuarios
export const listarUsuarios = async (req, res) => {
    try {
        const query = `SELECT * FROM sexpediente.users`;
        conexion.query(query, (error, results) => {
            if (error) {
                console.error('Error al listar usuarios:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener la lista de usuarios',
                });
            }

            return res.status(200).json({
                success: true,
                data: results,
            });
        });
    } catch (error) {
        console.error('Error en listarUsuarios:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al listar usuarios',
        });
    }
};

// Obtener usuario por ID
export const listarUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'El ID del usuario es requerido',
        });
    }

    try {
        const query = `SELECT * FROM sexpediente.users WHERE id = ?`;
        conexion.query(query, [id], (error, results) => {
            if (error) {
                console.error('Error al obtener usuario:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener la información del usuario',
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                });
            }

            return res.status(200).json({
                success: true,
                data: results[0],
            });
        });
    } catch (error) {
        console.error('Error en listarUsuarioPorId:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la información del usuario',
        });
    }
};
