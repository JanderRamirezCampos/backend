import conexion from '../database/db.js';

// Obtener todos los estados
export const getAllEstados = (req, res) => {
    conexion.query('SELECT * FROM sexpediente.estados', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener los estados' });
        }
        res.status(200).json(results);
    });
};

// Obtener un estado por ID
export const getEstadoById = (req, res) => {
    const { id } = req.params;
    conexion.query('SELECT * FROM sexpediente.estados WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener el estado' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.status(200).json(results[0]);
    });
};

// Crear un nuevo estado
export const createEstado = (req, res) => {
    const { tipo, descripcion } = req.body;

    /*
    if (!tipo || !descripcion) {
        return res.status(400).json({ message: 'Faltan datos para crear el estado' });
    }*/
    conexion.query('INSERT INTO sexpediente.estados (tipo, descripcion) VALUES (?, ?)', [tipo, descripcion], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al crear el estado' });
        }
        res.status(201).json({
            message: 'Estado creado con éxito',
            estado: { id: results.insertId, tipo, descripcion }
        });
    });
};

// Actualizar un estado
export const updateEstado = (req, res) => {
    const { id } = req.params;
    const { tipo, descripcion } = req.body;

    /*
    if (!tipo || !descripcion) {
        return res.status(400).json({ message: 'Faltan datos para actualizar el estado' });
    }*/
    conexion.query('UPDATE sexpediente.estados SET tipo = ?, descripcion = ? WHERE id = ?', [tipo, descripcion, id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al actualizar el estado' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.status(200).json({ message: 'Estado actualizado con éxito' });
    });
};

// Eliminar un estado
export const deleteEstado = (req, res) => {
    const { id } = req.params;
    conexion.query('DELETE FROM sexpediente.estados WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al eliminar el estado' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.status(200).json({ message: 'Estado eliminado con éxito' });
    });
};