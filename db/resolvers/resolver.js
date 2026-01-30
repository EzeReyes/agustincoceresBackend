import Cliente from '../../models/Cliente.js';
import Membresia from '../../models/Membresia.js';
import Curso from '../../models/Curso.js';
import Video from '../../models/Video.js';
import Producto from '../../models/Producto.js';
import MembresiaCliente from '../../models/MembresiaCliente.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { send } from '@emailjs/nodejs';


const resolvers = {
    Query: {
        obtenerClientes: async () => {
            const clientes = await Cliente.find();
            return clientes;
        },
        obtenerClientePorEmail: async (_, { email }) => {
            const cliente = await Cliente.findOne({ email });
            return cliente;
        },
        verificarSesion: (_, __, { req }) => {
            const cookies = cookie.parse(req.headers.cookie || '');
            console.log(cookies);
            const token = cookies.authToken;

            if (!token) {
                return { autenticado: false, usuario: null };
            }

            try {
                const datos = jwt.verify(token, process.env.JWT_SECRET);
                return { autenticado: true, usuario: datos };
            } catch {
                return { autenticado: false, usuario: null };
            }
        },
        obtenerMembresias: async () => {
            const membresias = await Membresia.find();
            return membresias;
        },
        obtenerMembresia: async (_, { id }) => {
            const membresia = await Membresia.findById(id).populate('cursos');
            return membresia;
        },
        obtenerCursos: async () => {
            const cursos = await Curso.find();
            return cursos;
        },
        // obtenerMembresia: async (_, { tipo }) => {
        //     const membresia = await Membresia.findOne({ tipo });
        //     return membresia;
        // },
        obtenerCursosCliente: async (_, { clienteId }) => {
            const cliente = await Cliente.findById(clienteId).populate('cursos');
            return cliente.cursos;
        },
        obtenerCliente: async (_, { id }) => {
            const cliente = await Cliente.findById(id);
            return cliente;
        },
        obtenerMembresiaCliente: async (_, { cliente }) => {
        try {
        console.log("🔥 resolver ejecutado");
        console.log("cliente:", cliente);

        const membresia = await MembresiaCliente.findOne({
            cliente: cliente
        }).populate('cliente').populate({
            path: 'membresia',
            populate: {
                path: 'cursos', 
                populate: {
                path: 'idVideo'
                }
            }
            });

        console.log("resultado:", membresia);

        return membresia;
    } catch (error) {
        console.error("Error en obtenerMembresiaCliente:", error);
        throw new Error('Error al obtener la membresía del cliente');
    }
        },
        obtenerMembresiasCliente: async () => {
            const membresiasCliente = await MembresiaCliente.find().populate('cliente').populate('membresia');
            return membresiasCliente;
        },
        obtenerCursosDisponibles: async () => {
            const cursos = await Curso.find();
            return cursos;
        },
        obtenerCursosNoInscritos: async (_, { clienteId }) => {
            const cliente = await Cliente.findById(clienteId);
            const cursosNoInscritos = await Curso.find({ _id: { $nin: cliente.cursos } });
            return cursosNoInscritos;
        },
        obtenerCurso: async (_, { id }) => {
            const curso = await Curso.findById(id);
            return curso;
        },
        obtenerProductos: async () => {
            const productos = await Producto.find();
            return productos;
        },
        obtenerCurso: async (_, { id }) => {
            try {
            const curso = await Curso.findById(id).populate('idVideo');
            return curso;
            } catch (error) {
            throw new Error('Error al obtener el curso');
            }
        },
        obtenerCursos: async () => {
            const cursos = await Curso.find().populate('idVideo');
            return cursos;
        },
        obtenerVideos: async () => {
            const videos = await Video.find();
            return videos;
        },
        obtenerVideo: async (_, {id}) => {
            const video = await Video.findById(id);
            console.log(video)
            return video;
        },
        obtenerMembresiaClienteID: async(_, {id}) => {
            const membresiaCliente = await MembresiaCliente.findById(id).populate('cliente').populate('membresia');
            return membresiaCliente;
        },
    },
    Mutation: {
        crearCliente: async (_, { input }) => {
            if (!input.nombre || !input.apellido || !input.email || !input.password || !input.telefono) {
                throw new Error('Todos los campos son obligatorios');
            }
            
            const { email } = input;
            const existeCliente = await Cliente.findOne({ email });

            if (existeCliente) {
                throw new Error('El cliente ya está registrado');
            }

            const salt = await bcrypt.genSalt(10);
            input.password = await bcrypt.hash(input.password, salt);
            console.log(input);

            const nuevoCliente = await new Cliente (input);
            nuevoCliente.save(); 
// 1. Obtener el ID generado
            const clienteId = nuevoCliente._id;

// 2. Generar token de confirmación
            const token = jwt.sign({ id: clienteId }, process.env.JWT_CONFIRM_SECRET, { expiresIn: '1d' });

// 3. Construir URL de confirmación
            const urlConfirmacion = `http://localhost:5173/confirmar/${token}`;

// 4. Enviar email
            await send(
                process.env.SERVICE_ID,
                process.env.TEMPLATE_ID,
                {
                    name: nuevoCliente.nombre,
                    email: nuevoCliente.email,
                    message: `Hola ${nuevoCliente.nombre}, confirmá tu cuenta haciendo clic en el siguiente enlace: ${urlConfirmacion}`,
                },
                {
                publicKey: process.env.PUBLIC_KEY,
                privateKey: process.env.PRIVATE_KEY
                }
            );

// 5. Retornar el ID
            return clienteId;
        },
        confirmarCuenta: async (_, { token }) => {
        try {
            const { id } = jwt.verify(token, process.env.JWT_CONFIRM_SECRET);
            const cliente = await Cliente.findById(id);

            if (!cliente) throw new Error('Usuario no encontrado');
            if (cliente.confirmado) return { success: false, message: 'Su cuenta se encuentra confirmada' };

            cliente.confirmado = true;
            await cliente.save();

            return { success: true, message: 'Cuenta confirmada correctamente' };
        } catch (error) {
            return { success: false, message: 'Token inválido o expirado' };
        }
        },
        crearCurso: async (_, { nombre, descripcion, url }) => {
            try {
                if (!nombre || !descripcion || !url) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Curso({ nombre, descripcion, url });
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        crearMembresia: async (_, { input }) => {
            try {
                const { nombre, precio, descripcion, cursos, video, poster } = input;
                if (!nombre || !precio) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Membresia({ nombre, precio, descripcion, cursos, video, poster });
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        modificarBaseDeMembresia: async (_, {idMembresia, input}) => {
            try {
                const existeMembresia = await Membresia.findOneAndUpdate(
                    { _id: idMembresia },
                    { $set: input },
                    { new: true }
                );
                return existeMembresia;
            } catch (error) {
                throw new Error(error);
            }
        },
        modificarMediaMembresia: async (_, { idMembresia, input }) => {
            try {
                const membresiaActualizada = await Membresia.findByIdAndUpdate(
                    idMembresia,
                    { $set: input },
                    { new: true }
                );

                if (!membresiaActualizada) {
                    throw new Error('Membresía no encontrada');
                }

                return membresiaActualizada;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        modificarCursosDeMembresia: async (_, { idMembresia, input }) => {
            try {
                const membresiaActualizada = await Membresia.findByIdAndUpdate(
                    idMembresia,
                    { $set: input },
                    { new: true }
                ).populate('cursos');

                if (!membresiaActualizada) {
                    throw new Error('La membresía no existe');
                }

                return membresiaActualizada;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        adherirMembresiaACliente: async (_, { cliente, membresia }) => {
        try {
            if (!cliente || !membresia ) {
            throw new Error('Todos los campos son obligatorios');
            }

            const fechaInicio = Date.now();

            // Crear instancia
            const datos = new MembresiaCliente({ cliente, membresia, fechaInicio });

            // Guardar en DB
            await datos.save();

            // Popular referencias
            const datosPopulated = await datos.populate('cliente membresia');

            return datosPopulated;
        } catch (error) {
            console.error(error);
            throw new Error('Error al crear la membresía del cliente');
        }
        },
        eliminarMembresiaDeCliente: async (_, {cliente, membresia}) => {
            try {
                const clienteEncontrado = await Cliente.findById(cliente);
                if(!clienteEncontrado) throw new Error('Cliente no Encontrado!');
                const membresiaEncontrada = await MembresiaCliente.findByIdAndDelete(membresia);
                if(!membresiaEncontrada) throw new Error('Membresia Inexistente');
                return "Membresia Eliminada";
            } catch (error) {
                throw new Error(error);
            }
        },
        modificarMembresiaDeCliente: async (_, {cliente, membresiaNueva}) => {
            try {
                const membresiaCliente = await MembresiaCliente.findOneAndUpdate(
                    { cliente },
                    { 
                        membresia: membresiaNueva,
                        fechaInicio: new Date()
                    },
                    { new: true }
                    );
                return membresiaCliente;
            } catch (error) {
                throw new Error(error);
            }  
        },
        agregarCursoACliente: async (_, { clienteId, cursoId }) => {
            try {
                const cliente = await Cliente.findById(clienteId);
                if (!cliente) {
                    throw new Error('Cliente no encontrado');
                }
                cliente.cursos.push(cursoId);
                await cliente.save();
                return cliente;
            } catch (error) {
                console.log(error);
            }
        },  
        login: async (_, { email, password }, { res }) => {
                        if (!email || !password) {
                            throw new Error('Todos los campos son obligatorios');
                        }
            
                        const cliente = await Cliente.findOne({ email });
            
                        if (!cliente) {
                            throw new Error('Credenciales incorrectas');
                        }
            
                        const passwordValida = await bcrypt.compare(password, cliente.password);
                        if (!passwordValida) {
                            throw new Error('Credenciales incorrectas');
                        }

                        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '20m' });
            
                        res.setHeader('Set-Cookie', cookie.serialize('authToken', token, {
                            httpOnly: true, // mantenelo activado para seguridad
                            secure: true, // true solo en prod con HTTPS
                            // secure: false,
                            maxAge: 1800,
                            sameSite: 'none',
                            // sameSite: 'lax',
                            path: '/'
                        }));

                        return {
                        mensaje: 'Sesión iniciada',
                        token
                        };
                        },
        logout: (_, __, { res }) => {
        res.setHeader('Set-Cookie', cookie.serialize('authToken', '', {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            secure: true,
            maxAge: 0,
            // sameSite: 'lax',
            sameSite: 'none',
            path: '/'
        }));

        return 'Sesión cerrada';
        },
        reset: async (_, { email }) => {
// Buscar por su email la cuenta

            const cliente = await Cliente.findOne({email});
            if(!cliente) {
                throw new Error ('Esa cuenta no existe')
            }
            
            cliente.confirmado = false;
            const clienteId = cliente._id

            const token = jwt.sign({ id: clienteId }, process.env.JWT_CONFIRM_SECRET, { expiresIn: '1d' });

            const urlConfirmacion = `http://localhost:5173/reset/${token}`;

            await send(
                process.env.SERVICE_ID,
                process.env.TEMPLATE_ID,
                {
                    name: cliente.nombre,
                    email: cliente.email,
                    message: `Hola ${cliente.nombre}, para modificar tu contraseña, hace clic en el siguiente enlace: ${urlConfirmacion}`,
                },
                {
                publicKey: process.env.PUBLIC_KEY,
                privateKey: process.env.PRIVATE_KEY
                }
            );        
            return ('Verifica tu email, allí encontrarás un link de redirección para modificar tu contraseña')
        },
        cambioPass: async (_, {token, password}) => {
            const { id } = jwt.verify(token, process.env.JWT_CONFIRM_SECRET);
            const cliente = await Cliente.findById(id);

            if (!cliente) throw new Error('Usuario no encontrado');

            const salt = await bcrypt.genSalt(10);
            const nuevoPassword = await bcrypt.hash(password, salt);
            cliente.password = nuevoPassword;
            cliente.confirmado = true;

            await cliente.save();

            return { estado: true, mensaje: 'Password modificado serás redirigido a login' };
        },
        crearCurso: async (_, { nombre, descripcion, idVideo, parrafo, info }) => {
            try {
                if (!nombre || !descripcion || !idVideo || !parrafo || !info) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Curso({ nombre, descripcion, idVideo, parrafo, info }).populate('idVideo');
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        crearVideo: async (_, { titulo, descripcion, duracion, idVideo }) => {
            try {
                if (!titulo || !descripcion || !duracion || !idVideo) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Video({ titulo, descripcion, duracion, idVideo });
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        agregarCursoAMembresia: async (_, { membresiaId, cursoId }) => {
        try {
            const membresia = await Membresia.findOneAndUpdate(
            { 
                _id: membresiaId,
                cursos: { $ne: cursoId }
            },
            { 
                $push: { cursos: cursoId }
            },
            { new: true }
            );

            if (!membresia) {
            throw new Error('La membresía no existe o el curso ya está asignado');
            }

            return membresia;
        } catch (error) {
            throw new Error(error.message);
        }
        },
        eliminarMembresia: async (_, {membresiaId}) => {
            const membresiaExiste = await Membresia.findByIdAndDelete(membresiaId);
            if(!membresiaExiste) {
                throw new Error(error);
            }
            return "La membresia fue eliminada con exito!"
        },
        modificarCurso: async (_, {id, nombre, descripcion, idVideo, info, parrafo}) => {
            try {
                const cursoActualizado = await Curso.findByIdAndUpdate(
                    id,
                    { 
                        nombre,
                        descripcion,
                        idVideo,
                        info,
                        parrafo
                    },
                    { new: true }
                ).populate('idVideo');
                if (!cursoActualizado) {
                    throw new Error('Curso no encontrado');
                }
                return cursoActualizado;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        eliminarCurso: async (_, { id }) => {
            try {
                const cursoEliminado = await Curso.findByIdAndDelete(id);
                if (!cursoEliminado) {
                    throw new Error('Curso no encontrado');
                }
                return 'Curso eliminado correctamente';
            } catch (error) {
                throw new Error(error.message);
            }
        },
        eliminarVideo: async (_, { id }) => {
            try {
                const videoEliminado = await Video.findByIdAndDelete(id);
                if (!videoEliminado) {
                    throw new Error('Video no encontrado');
                }
                return 'Video eliminado correctamente';
            } catch (error) {
                throw new Error(error.message);
            }
        },
        modificarVideo: async (_, { id, titulo, descripcion, duracion }) => {
            try {
                const videoActualizado = await Video.findByIdAndUpdate(
                    id,
                    { 
                        titulo,
                        descripcion,
                        duracion
                    },
                    { new: true }
                );
                if (!videoActualizado) {
                    throw new Error('Video no encontrado');
                }
                return videoActualizado;
            }
            catch (error) {
                throw new Error(error.message);
            }
        }
    }
};

export default resolvers;
