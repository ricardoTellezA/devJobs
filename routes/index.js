const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacatesController = require('../controllers/vacatesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');


module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //CREAR VACANTES
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacatesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva',
        authController.verificarUsuario,
        vacatesController.validarVacante,
        vacatesController.agregarVacante


    );

    //show VACANTES

    router.get('/vacantes/:url', vacatesController.mostrarVacante);

    //TDO EDIT VACANTS

    router.get('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacatesController.formEditarVacante

    );
    router.post('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacatesController.validarVacante,
        vacatesController.editarVacante
    );

    //ELIMINAR VACANTES

    router.delete('/vacantes/eliminar/:id',
    vacatesController.eliminarVacante,
    );


    //CREAR CUENTAS

    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,
        usuariosController.crearUsuario);


    //autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    //CERRAR SESION
    router.get('/cerrar-sesion',
    authController.verificarUsuario,
    authController.cerrarSesion,
    );


    //recetiar pass

    router.get('/reestablecer-password', authController.formRestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);


    //recetear pass, almacenar en db
    router.get('/reestablecer-password/:token', authController.restablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);


    //PANEL DE ADMINISTRACION
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    //EDIDAR perfil

    router.get('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );


    router.post('/editar-perfil',
        authController.verificarUsuario,
        // usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
        );


        //resibir mensajes de los candidatos
        router.post('/vacantes/:url', 
        vacatesController.subirCv,
        vacatesController.contactar,
        );


        //Mostrar los candidatos por vacantes

        router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacatesController.mostrarCandidatos
        )


        //BUSCADOR DE VACANTES
        router.post('/buscador', vacatesController.buscarVacantes);



    return router;
}