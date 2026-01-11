import { gql} from 'graphql-tag';

const typeDefs = gql`

    type Cliente {
        id: ID!
        nombre: String!
        apellido: String!
        email: String!
        password: String!
        telefono: String
        membresiaActiva: MembresiaCliente
        cursos: [Curso]
        confirmado: Boolean
    }

    type MembresiaCliente {
        id: ID!
        cliente: Cliente!
        membresia: Membresia!
        pago: Pago!
        fechaInicio: String!
    }

    type Membresia {
        id: ID!
        nombre: String!
        precio: String!
        cursos: [Curso]
        descripcion: String!
        video: String!
    }

    type Pago {
        id: ID!
        cliente: Cliente!
        fecha: String!
        monto: Float!
    }

    type Curso {
        id: ID!
        nombre: String!
        descripcion: String!
        info: String!
        parrafo: String!
        idVideo: Video!
        img: String
    }

    type Video {
        id: ID!
        titulo: String!
        descripcion: String!
        duracion: Float!
        idVideo: String!
    }

    type Producto {
        id: ID!
        nombre: String!
        descripcion: String!
        precio: Float!
        img: String
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
        telefono: String
    }

    input MembresiaInput {
        tipo: String!
        precio: String!
        descripcion: String!
    }

    type LoginResponse {
        token: String
        mensaje: String!    
    }   
    
    type ConfirmResponse {
        mensaje: String!
        estado: Boolean!
    }

    type Sesion {
        autenticado: Boolean!
        usuario: Cliente    
    }


    type Query {
        obtenerClientePorEmail(email: String!): Cliente
        obtenerClientes: [Cliente]
        obtenerMembresias: [Membresia]
        obtenerCursos: [Curso]
        obtenerCursosCliente(clienteId: ID!): [Curso]
        obtenerCliente(id: ID!): Cliente
        obtenerMembresiaCliente(cliente: ID!): MembresiaCliente
        obtenerPagosCliente(clienteId: ID!): [Pago]
        obtenerCursosDisponibles: [Curso]
        obtenerCursosNoInscritos(clienteId: ID!): [Curso]
        obtenerCurso(id: ID!): Curso
        obtenerMembresiasCliente: [MembresiaCliente]
        obtenerPago(id: ID!): Pago
        verificarSesion: Sesion!
        obtenerProductos: [Producto]!
        obtenerVideos: [Video]!
        obtenerVideo(idVideo: ID!): Video
        obtenerMembresiaClienteID(id: ID!): MembresiaCliente
    }

    type Mutation {
        crearCliente(input: ClienteInput!): ID
        confirmarCuenta(token: String): ConfirmResponse
        crearCurso(nombre: String!, descripcion: String!, idVideo: ID!, info: String!, parrafo: String!): Curso
        crearMembresia(input: MembresiaInput!): Membresia!
        crearPago(clienteId: ID!, fecha: String!, monto: Float!): Pago!
        crearMembresiaCliente(cliente: ID!, membresia: ID!, pago: ID!, fechaInicio: String!): MembresiaCliente!
        agregarCursoACliente(clienteId: ID!, cursoId: ID!): Cliente!
        login(email: String!, password: String!): LoginResponse
        logout: String
        reset(email: String): String
        cambioPass(token: String, password: String): ConfirmResponse
        crearProducto(nombre: String!, descripcion: String!, precio: Float!, imagen: String): Producto!
        crearVideo(titulo: String!, descripcion: String!, duracion: Float!, idVideo: String!, url: String!): Video!
        agregarCursoAMembresia(membresiaId: ID!, cursoId: ID!): Membresia!
    }


`

export default typeDefs;