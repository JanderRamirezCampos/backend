// backend/controllers/expedienteController.js
import conexion from '../database/db.js';

// Listar expedientes
export const listExpedientes = (req, res) => {
    // Consulta todos los expedientes de la base de datos
    conexion.query('SELECT * FROM sexpediente.expedientes', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener los expedientes' });
        }

        // Responder con la lista de expedientes
        res.status(200).json(results);
    });
};

export const listExpedientesPorId = (req, res) => {
    const { id } = req.params;

    // Consulta para obtener un expediente específico por su id, y formatear las fechas
    const query = `
        SELECT 
            id, 
            num_expediente, 
            DATE_FORMAT(fecha_creacion, '%Y-%m-%d') AS fecha_creacion,
            DATE_FORMAT(fecha_recepcion, '%Y-%m-%d') AS fecha_recepcion,
            nombre, 
            asunto, 
            procedimiento, 
            num_oficio_atencion, 
            estado_actual, 
            comentarios
        FROM sexpediente.expedientes 
        WHERE id = ?`;

    conexion.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener el expediente' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Expediente no encontrado' });
        }

        // Devolver el expediente encontrado con fechas en el formato adecuado
        res.status(200).json(results[0]);
    });
};

export const verificarExpedientePorNumero = (req, res) => {
    const { num_expediente } = req.params;

    // Consulta para verificar si el número de expediente ya existe
    const query = `
        SELECT id
        FROM sexpediente.expedientes 
        WHERE num_expediente = ?`;

    conexion.query(query, [num_expediente], (err, results) => {
        /*
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al verificar el expediente' });
        }
        */
        if (results.length > 0) {
            // Si ya existe, devolver un objeto con 'exists' en lugar de 'id'
            return res.status(200).json({ exists: true });
        }

        // Si no existe, responder con 'exists: false'
        //res.status(404).json({ exists: false, message: 'Expediente no encontrado' });
    });
};

// Crear un nuevo expediente
export const createExpediente = (req, res) => {
    const {num_expediente,fecha_creacion,fecha_recepcion,nombre,asunto,procedimiento,num_oficio_atencion,comentarios,creado_por,estado_actual} = req.body;

    /*
    if (!num_expediente || !nombre || !asunto || !estado_actual || !creado_por) {
        return res.status(400).json({ message: 'Faltan datos para crear el expediente' });
    }
    */
    // Crear el expediente
    conexion.query('INSERT INTO sexpediente.expedientes (num_expediente, fecha_creacion, fecha_recepcion, nombre, asunto, procedimiento, num_oficio_atencion, comentarios, creado_por, estado_actual) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [num_expediente, fecha_creacion, fecha_recepcion, nombre, asunto, procedimiento, num_oficio_atencion, comentarios, creado_por, estado_actual], 
    (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al crear el expediente' });
        }

        // Registrar el primer estado en expediente_estado
        const expediente_id = results.insertId;
        conexion.query('INSERT INTO sexpediente.expediente_estado (expediente_id, estado_id, cambiado_por) VALUES (?, ?, ?)', 
        [expediente_id, estado_actual, creado_por], 
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al registrar el estado inicial' });
            }

            res.status(201).json({ message: 'Expediente creado con éxito' });
        });
    });
};

export const updateExpediente = (req, res) => {
    console.log('Datos recibidos:', req.body);
    console.log('expediente_id:', req.params.expediente_id);  // Verifica que esté llegando correctamente el ID
    
    const { expediente_id } = req.params; // Obtén el ID del expediente a actualizar desde los parámetros de la URL
    const { num_expediente, fecha_creacion, fecha_recepcion, nombre, asunto, procedimiento, num_oficio_atencion, comentarios, estado_actual, creado_por } = req.body;

    /*
    if (!num_expediente || !nombre || !asunto || !estado_actual || !creado_por) {
        return res.status(400).json({ message: 'Faltan datos para actualizar el expediente' });
    }*/

    // Si todos los datos están presentes, continua con la actualización
    conexion.query('UPDATE sexpediente.expedientes SET num_expediente = ?, fecha_creacion = ?, fecha_recepcion = ?, nombre = ?, asunto = ?, procedimiento = ?, num_oficio_atencion = ?, comentarios = ?, estado_actual = ? WHERE id = ?',
    [num_expediente, fecha_creacion, fecha_recepcion, nombre, asunto, procedimiento, num_oficio_atencion, comentarios, estado_actual, expediente_id], 
    (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al actualizar el expediente' });

        }

        // Si el estado ha cambiado, actualiza el historial de estado
        if (estado_actual) {
            // Registrar el nuevo estado en expediente_estado
            conexion.query('INSERT INTO sexpediente.expediente_estado (expediente_id, estado_id, cambiado_por) VALUES (?, ?, ?)', 
            [expediente_id, estado_actual, creado_por], 
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Error al registrar el cambio de estado' });
                }

                res.status(200).json({ message: 'Expediente actualizado con éxito' });
            });
        } else {
            res.status(200).json({ message: 'Expediente actualizado con éxito' });
        }
    });
};

export const deleteExpediente = (req, res) => {
    const id = req.params.id;

    // Realiza la eliminación directa en la base de datos
    conexion.query('DELETE FROM sexpediente.expedientes WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al eliminar el expediente' });
        }
        res.status(200).json({ message: 'Expediente eliminado con éxito' });
    });
};


export const changeExpedienteEstado = (req, res) => {
    const { expediente_id, estado_id, cambiado_por } = req.body;
    /*
    if (!expediente_id || !estado_id || !cambiado_por) {
        return res.status(400).json({ message: 'Faltan datos para cambiar el estado del expediente' });
    }
    */
    // Actualizar el estado actual en la tabla expedientes
    conexion.query('UPDATE sexpediente.expedientes SET estado_actual = ? WHERE id = ?', [estado_id, expediente_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al actualizar el estado del expediente' });
        }

        // Registrar el cambio en la tabla expediente_estado
        conexion.query('INSERT INTO sexpediente.expediente_estado (expediente_id, estado_id, cambiado_por) VALUES (?, ?, ?)', 
        [expediente_id, estado_id, cambiado_por], 
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al registrar el cambio de estado' });
            }

            res.status(200).json({ message: 'Estado del expediente actualizado con éxito' });
        });
    });
};

export const getExpedienteEstadoHistory = (req, res) => {
    const { expediente_id } = req.params;

    conexion.query('SELECT e.tipo AS estado, e.descripcion, es.cambiado_por, es.cambiado_en FROM expediente_estado es JOIN estados e ON es.estado_id = e.id WHERE expediente_id = ? ORDER BY es.cambiado_en DESC;', 
    [expediente_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener el historial de estados' });
        }
        res.status(200).json(results);
    });
};

export const countExpedientesByStatus = (req, res) => {
    const query = `
        SELECT estado_actual, COUNT(*) AS total
        FROM sexpediente.expedientes
        GROUP BY estado_actual
    `;

    conexion.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener los conteos de expedientes' });
        }

        res.status(200).json(results);
    });
};