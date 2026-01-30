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
        fechaInicio: String!
    }

    type Membresia {
        id: ID!
        nombre: String!
        precio: String!
        cursos: [Curso]
        descripcion: String!
        video: String!
        poster: String!
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
        nombre: String!
        precio: String!
        cursos: [ID!]!
        descripcion: String!
        video: String!
        poster: String!
    }

    input MembresiaBaseInput {
        nombre: String!
        precio: String!
        descripcion: String!
    }

    input MediaMembresiaInput {
        video: String!
        poster: String!
    }

    input CursosMembresiaInput {
        cursos: [ID!]!
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
        obtenerMembresia(id: ID!): Membresia
        obtenerCursos: [Curso]
        obtenerCursosCliente(clienteId: ID!): [Curso]
        obtenerCliente(id: ID!): Cliente
        obtenerMembresiaCliente(cliente: ID!): MembresiaCliente
        obtenerCursosDisponibles: [Curso]
        obtenerCursosNoInscritos(clienteId: ID!): [Curso]
        obtenerCurso(id: ID!): Curso
        obtenerMembresiasCliente: [MembresiaCliente]
        verificarSesion: Sesion!
        obtenerProductos: [Producto]!
        obtenerVideos: [Video]!
        obtenerVideo(id: ID!): Video!
        obtenerMembresiaClienteID(id: ID!): MembresiaCliente
    }

    type Mutation {
        crearCliente(input: ClienteInput!): ID
        confirmarCuenta(token: String): ConfirmResponse
        crearCurso(nombre: String!, descripcion: String!, idVideo: ID!, info: String!, parrafo: String!): Curso
        modificarCurso(id: ID!, nombre: String!, descripcion: String!, idVideo: ID!, info: String!, parrafo: String!): Curso!
        eliminarCurso(id: ID!): String!
        crearMembresia(input: MembresiaInput!): Membresia!
        modificarBaseDeMembresia(idMembresia: ID!, input: MembresiaBaseInput!): Membresia!
        modificarMediaMembresia(idMembresia: ID!, input: MediaMembresiaInput!): Membresia!
        modificarCursosDeMembresia(idMembresia: ID!, input: CursosMembresiaInput!): Membresia!
        adherirMembresiaACliente(cliente: ID!, membresia: ID!): MembresiaCliente!
        eliminarMembresiaDeCliente(cliente: ID!, membresia: ID!): String!
        modificarMembresiaDeCliente(cliente: ID!, membresiaNueva: ID!): MembresiaCliente!
        agregarCursoACliente(clienteId: ID!, cursoId: ID!): Cliente!
        login(email: String!, password: String!): LoginResponse
        logout: String
        reset(email: String): String
        cambioPass(token: String, password: String): ConfirmResponse
        crearProducto(nombre: String!, descripcion: String!, precio: Float!, imagen: String): Producto!
        crearVideo(titulo: String!, descripcion: String!, duracion: Float!, idVideo: String!): Video!
        agregarCursoAMembresia(membresiaId: ID!, cursoId: ID!): Membresia!
        eliminarMembresia(membresiaId: ID!): String!
        eliminarVideo(id: ID!): String!
        modificarVideo(id: ID!, titulo: String!, descripcion: String!, duracion: Float!): Video!
    }


`

export default typeDefs;