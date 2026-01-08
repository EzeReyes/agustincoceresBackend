import mongoose from "mongoose";

const VideoSchema = mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    duracion: { type: Number, required: true },
    idVideo: { type: String, required: true },
});

const Video = mongoose.model('Video', VideoSchema);

export default Video;