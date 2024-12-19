import mysql from 'mysql2';
import dotenv from 'dotenv';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

const conexion = mysql.createConnection({
    host: 'localhost',       // Lee host desde .env
    user: 'root',       // Lee usuario desde .env
    password: 'root', // Lee contraseña desde .env
    database: 'sexpediente' // Lee nombre de la base de datos desde .env
});

conexion.connect((err) => {
    if (err) {
        console.error('Error al conectar:', err.stack);
        return;
    }
    console.log('¡Conectado a la base de datos!');
});

export default conexion;