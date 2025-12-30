import mongoose from "mongoose";

const CursoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    img: {
        type: String,
        trim: true
    }
});

const Curso = mongoose.model('Curso', CursoSchema);

export default Curso;