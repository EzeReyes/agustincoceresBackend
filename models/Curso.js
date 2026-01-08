import mongoose, { Schema } from "mongoose";

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
    idVideo: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
    },
    img: {
        type: String,
        trim: true
    }
});

const Curso = mongoose.model('Curso', CursoSchema);

export default Curso;