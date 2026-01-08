import Cliente from '../../models/Cliente.js';
import Membresia from '../../models/Membresia.js';
import Pago from '../../models/Pago.js';
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
        obtenerCursos: async () => {
            const cursos = await Curso.find();
            return cursos;
        },
        obtenerMembresia: async (_, { tipo }) => {
            const membresia = await Membresia.findOne({ tipo });
            return membresia;
        },
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
            }).populate('pago');

        console.log("resultado:", membresia);

        return membresia;
    } catch (error) {
        console.error("Error en obtenerMembresiaCliente:", error);
        throw new Error('Error al obtener la membresía del cliente');
    }
        },
        obtenerMembresiasCliente: async () => {
            const membresiasCliente = await MembresiaCliente.find().populate('cliente').populate('membresia').populate('pago');
            return membresiasCliente;
        },
        obtenerPagosCliente: async (_, { clienteId }) => {
            const pagos = await Pago.find({ cliente: clienteId });
            return pagos;
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
        obtenerPago: async (_, {id}) => {
            const pago = await Pago.findById(id);
            return pago;
        },
        obtenerProductos: async () => {
            const productos = await Producto.find();
            return productos;
        },
        obtenerCurso: async (_, { id }) => {
            const curso = await Curso.findById(id);
            return curso;
        },
        obtenerCursos: async () => {
            const cursos = await Curso.find();
            return cursos;
        },
        obtenerVideos: async () => {
            const videos = await Video.find();
            return videos;
        },
        obtenerVideo: async (_, {idVideo}) => {
            const video = await Video.findOne({idVideo});
            console.log(video);
            return video;
        },
        obtenerMembresiaClienteID: async(_, {id}) => {
            const membresiaCliente = await MembresiaCliente.findById(id).populate('cliente').populate('membresia').populate('pago');
            return membresiaCliente;
        }
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
        crearMembresia: async (_, { nombre, precio }) => {
            try {
                if (!tipo || !precio) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Membresia({ tipo, precio });
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        crearPago: async (_, { clienteId, fecha, monto }) => {
            try {
                if (!clienteId || !fecha || !monto) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Pago({ cliente: clienteId, fecha, monto });
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        crearMembresiaCliente: async (_, { cliente, membresia, pago, fechaInicio }) => {
        try {
            if (!cliente || !membresia || !pago || !fechaInicio) {
            throw new Error('Todos los campos son obligatorios');
            }

            // Crear instancia
            const datos = new MembresiaCliente({ cliente, membresia, pago, fechaInicio });

            // Guardar en DB
            await datos.save();

            // Popular referencias
            const datosPopulated = await datos.populate('cliente membresia pago');

            return datosPopulated;
        } catch (error) {
            console.error(error);
            throw new Error('Error al crear la membresía del cliente');
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
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // secure: true,
            maxAge: 1800,
            sameSite: 'lax',
            // sameSite: 'none',
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
                secure: true,         // requiere HTTPS
                maxAge: 1800,
                sameSite: 'lax',      // si frontend y backend están en el mismo dominio
                path: '/'
                // sino
                // httpOnly: true,
                // secure: false,        // en local, sin HTTPS
                // maxAge: 1800,
                // sameSite: 'none',     // permite cross-site
                // path: '/'
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

            return { success: true, message: 'Password modificado serás redirigido a login' };
        },
        crearCurso: async (_, { nombre, descripcion, idVideo }) => {
            try {
                if (!nombre || !descripcion || !idVideo) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Curso({ nombre, descripcion, idVideo });
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        crearVideo: async (_, { titulo, descripcion, duracion, url }) => {
            try {
                if (!titulo || !descripcion || !duracion || !url) {
                    throw new Error('Todos los campos son obligatorios');
                }
            const datos = await new Video({ titulo, descripcion, duracion, url });
            datos.save(); 
            return datos;
            } catch (error) {
                console.log(error);
            }
        },
        agregarCursoAMembresia: async (_, { membresiaId, cursoId }) => {
            try {
                const membresia = await Membresia.findById(membresiaId);
                if (!membresia) {
                    throw new Error('Membresia no encontrada');
                }
                membresia.cursos.push(cursoId);
                await membresia.save();
                return membresia;
            } catch (error) {
                console.log(error);
            }
        },
    }
};

export default resolvers;
