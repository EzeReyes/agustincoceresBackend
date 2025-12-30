import mongoose from "mongoose";

const productoSchema = mongoose.Schema({
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
    precio: {
        type: Number,
        required: true,
    },
    img: {
        type: String,
        trim: true,
    }
});

const Producto = mongoose.model('Producto', productoSchema);

export default Producto;