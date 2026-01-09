import mongoose from "mongoose";

const MembresiaSchema = mongoose.Schema({
    nombre: {
    type: String,
    default: 'Membresia Standard'
    },
    precio: { type: Number, required: true },
    cursos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }],
    descripcion: { type: String, required: true }
});

const Membresia = mongoose.model('Membresia', MembresiaSchema);

export default Membresia;