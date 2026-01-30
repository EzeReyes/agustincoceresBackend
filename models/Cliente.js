import mongoose from "mongoose";
const { Schema, model } = mongoose;

const clienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        trim: true,
    },
    membresiaActiva: {
        type: Schema.Types.ObjectId,
        ref: 'MembresiaCliente'
    },
    confirmado: {
        type: Boolean,
        default: false
    }, 
    cursos: [{type: Schema.Types.ObjectId, ref: 'Curso'}]
});

const Cliente = mongoose.model('Cliente', clienteSchema);

export default Cliente;