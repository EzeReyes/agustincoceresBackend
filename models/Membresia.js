import mongoose from "mongoose";

const MembresiaSchema = mongoose.Schema({
    nombre: {
    type: String,
    default: 'Membresia Standard'
    },
    poster: { type: String },
    precio: { type: Number, required: true },
    cursos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }],
    descripcion: { type: String, required: true },
    video: { type: String },
});

const Membresia = mongoose.model('Membresia', MembresiaSchema);

export default Membresia;