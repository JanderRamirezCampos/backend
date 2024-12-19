//importamos la conexion a la base de datos
import db from "../database/db.js";
//importamos sequelize
import { DataTypes } from "sequelize";

const UsuarioModel = db.define('Usuarios',{
    user: {type: DataTypes.STRING},
    pass: {type: DataTypes.STRING},
    dni: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    correo: {type: DataTypes.STRING},
    telefono: {type: DataTypes.STRING},
    rol: {type: DataTypes.STRING},
    imagen: {type: DataTypes.STRING},
    createdAt: {type: DataTypes.DATE},
    updatedAt: {type: DataTypes.DATE}
})

export default UsuarioModel;