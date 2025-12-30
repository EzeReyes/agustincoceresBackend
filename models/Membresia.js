import mongoose from "mongoose";

const MembresiaSchema = mongoose.Schema({
    tipo: {
    type: String,
    enum: ['BASICA', 'PREMIUM'],
    default: 'BASICA'
    },
    precio: { type: Number, required: true }
});

const Membresia = mongoose.model('Membresia', MembresiaSchema);

export default Membresia;