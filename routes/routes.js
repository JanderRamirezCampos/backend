//ENRUTADOR PARA REDIRECCIONAR LAS PAGINAS
import express from 'express'
const router = express.Router();
import { auth, editarUsuario, eliminarUsuario, listarUsuarioPorId, listarUsuarios, register } from '../controllers/authController.js';
import { getAllEstados, getEstadoById, createEstado, updateEstado, deleteEstado } from '../controllers/estadoController.js';
import { createExpediente, updateExpediente, changeExpedienteEstado, getExpedienteEstadoHistory, listExpedientes, listExpedientesPorId, deleteExpediente, verificarExpedientePorNumero, countExpedientesByStatus } from '../controllers/expedienteController.js';

/* ------------------------- USUARIOS ----------------------------------- */
// Listar usuarios
router.get('/users/listar', listarUsuarios);
// Listar usuarios por id
router.get('/users/:id', listarUsuarioPorId);
// Autenticacion de usuarios
router.post('/users/auth', auth);
// Agregar un usuario
router.post('/users/register', register);
// Eliminar un usuario
router.delete('/users/:id', eliminarUsuario)
// Editar un usuario
router.put('/users/:id', editarUsuario)

/* ------------------------- ESTADOS ----------------------------------- */
// Listar estados
router.get('/estados/listar', getAllEstados);
// Obtener un estado por ID
router.get('/estados/listid/:id', getEstadoById);
// Crear un nuevo estado
router.post('/estados/create', createEstado);
// Actualizar un estado
router.put('/estados/editar/:id', updateEstado);
// Eliminar un estado
router.delete('/estados/eliminar/:id', deleteEstado);

/* ------------------------- FIN DE ESTADOS ----------------------------------- */

/* ------------------------- EXPEDIENTES ----------------------------------- */

// Listar expedientes
router.get('/expedientes/list', listExpedientes);
// Contar los tipos de estados de los expedientes
router.get('/expedientes/estado/count', countExpedientesByStatus);
// Crear un nuevo expediente
router.post('/expedientes/create', createExpediente);
//Eliminar un nuevo expediente
router.delete('/expedientes/:id', deleteExpediente);
// Actualizar un expediente
router.put('/expedientes/:expediente_id', updateExpediente);
// Buscar expediente por ID
router.get('/expedientes/:id', listExpedientesPorId);
// Verificar un expediente por numero
router.get('/expedientes/numero/:num_expediente', verificarExpedientePorNumero);
// Cambiar el estado de un expediente
router.put('/expedientes/estado', changeExpedienteEstado);
// Obtener el historial de estados de un expediente
router.get('/expedientes/:expediente_id/estados', getExpedienteEstadoHistory);

/* ------------------------- FIN DE EXPEDIENTES ----------------------------------- */


/*---------------------Autenticacion---------------------------*/

router.post('/auth', auth);

/*---------------------Fin Autenticacion---------------------------*/
//Exportamos
export default router;



