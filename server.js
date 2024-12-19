import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import blogRoutes from './routes/routes.js';
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import passport from 'passport';
import { googleLoginVerify } from './controllers/authController.js';

const app = express();

// Configuración de variables de entorno
dotenv.config({ path: './env/.env' });

// Middleware para capturar datos del formulario
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configuración de cookie-parser
app.use(cookieParser());

// Configuración de cookie-session
app.use(
    cookieSession({
        name: "session",
        keys: [process.env.SECRET_KEY],
        maxAge: 24 * 60 * 60 * 1000, // 1 día de duración
        sameSite: 'lax', // Ajustar según el entorno (strict, lax, none)
        secure: process.env.NODE_ENV === 'production', // Asegura cookies en producción
    })
);

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

const whiteList = ['http://localhost:3000']
// Configuración de CORS
app.use(cors({
    origin: whiteList,
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    credentials: true
}));

// Middleware para manejar solicitudes preflight
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Referencia a nuestro enrutador principal
app.use('/', blogRoutes);
// Ruta para confirmar al usuario
app.get('/confirmar/:userName', (req, res) => {
    const { userName } = req.params;
    res.send(`Usuario confirmado: ${userName}`);
});

// Configuración de rutas para Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth/login',
}), (req, res) => {
    // Redirigir al frontend con información de usuario
    res.redirect(`http://localhost:3000/dashboard?user=${req.user.displayName}`);
});

// Ruta para manejar la autenticación con Google
app.post('/users/auth/google', googleLoginVerify);

// Ruta de logout
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Ruta protegida 
app.get('/admin/index', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login'); // Redirigir al login si no está autenticado
    }
    res.send(`Bienvenido al panel de administración, ${req.user.displayName}`);
});

// Ruta raíz para verificar estado del usuario
app.get("/", (req, res) => {
    res.send(req.user ? `Bienvenido ${req.user.displayName}` : "Inicia sesión");
});

//// Endpoint prueba
app.get('/api/prueba', (req, res) => {
    res.status(200).json({ message: 'Holaaaaa' });
});


// Inicializar el servidor
app.listen(8080, () => {
    console.log('Corriendo el servidor Escuela de Posgrado');
});
