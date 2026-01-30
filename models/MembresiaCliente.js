import mongoose from "mongoose";
const { Schema, model } = mongoose;


const MembresiaClienteSchema = mongoose.Schema({
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    membresia: {
        type: Schema.Types.ObjectId,
        ref: 'Membresia',
        required: true
        },
    fechaInicio: {
        type: Date,
        default: Date.now
    }

});

const MembresiaCliente = mongoose.model('MembresiaCliente', MembresiaClienteSchema);

export default MembresiaCliente;