import mongoose from "mongoose";
const { Schema, model } = mongoose;


const PagoSchema = mongoose.Schema({
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    monto: {
        type: Number,
        required: true
    },
});

const Pago = mongoose.model('Pago', PagoSchema);

export default Pago;