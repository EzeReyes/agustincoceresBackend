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
        tipo: String!
        precio: String!
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
        url: String!
        img: String
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
    }

    input CursoInput {
        nombre: String!
        descripcion: String!
        url: String!
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
        obtenerMembresia(tipo: String!): Membresia
        obtenerCursosCliente(clienteId: ID!): [Curso]
        obtenerCliente(id: ID!): Cliente
        obtenerMembresiaCliente(clienteId: ID!): MembresiaCliente
        obtenerPagosCliente(clienteId: ID!): [Pago]
        obtenerCursosDisponibles: [Curso]
        obtenerCursosNoInscritos(clienteId: ID!): [Curso]
        obtenerCurso(id: ID!): Curso
        obtenerMembresiaClientePorId(id: ID!): MembresiaCliente
        obtenerPago(id: ID!): Pago
        verificarSesion: Sesion!
        obtenerProductos: [Producto]!
    }

    type Mutation {
        crearCliente(input: ClienteInput!): ID
        confirmarCuenta(token: String): ConfirmResponse
        crearCurso(nombre: String!, descripcion: String!, url: String!): Curso
        crearMembresia(tipo: String!, precio: Float!): Membresia!
        crearPago(clienteId: ID!, fecha: String!, monto: Float!): Pago!
        crearMembresiaCliente(cliente: ID!, membresia: ID!, pago: ID!, fechaInicio: String!): MembresiaCliente!
        agregarCursoACliente(clienteId: ID!, cursoId: ID!): Cliente!
        login(email: String!, password: String!): LoginResponse
        logout: String
        reset(email: String): String
        cambioPass(token: String, password: String): ConfirmResponse
        crearProducto(nombre: String!, descripcion: String!, precio: Float!, imagen: String): Producto!
    }


`

export default typeDefs;