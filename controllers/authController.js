const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');



exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//REVISAR QUE EL USUARIO ESTE AUTENTICADO O NO
exports.verificarUsuario = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {

    //consultar al usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id });



    res.render('administracion', {
        nombrePagina: 'Panel de administración',
        tagline: 'Crea y Administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre: req.user.nombre,
        img: req.user.imagen,
        vacantes,

    });
}


exports.cerrarSesion = (req, res) => {
    req.logout();

    req.flash('correcto', 'Cerraste Sesión correctamente');
    return res.redirect('/iniciar-sesion');
}



//form para reiniciar


exports.formRestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Restablece tu Password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password coloca tu email'
    });
}



//generar token en db

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if (!usuario) {
        req.flash('error', 'No existe esta cuenta');
        return res.redirect('/iniciar-sesion');
    }


    //si el usuario existe, se genera el token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    //guardar

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    console.log(resetUrl);



    await enviarEmail.enviar({
        usuario,
        subjet: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });
    //bien
    req.flash('correcto', 'Revisa tu email para indicaciones')
    res.redirect('/iniciar-sesion');



}


//valida el token y si el usuario existe mostrar vista

exports.restablecerPassword = async (req, res) => {
    const usuarios = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if (!usuarios) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }


    //TODO BIEN, MOSTRAR FORMULARIOS
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })
}


//almacena el nuevo password en db

exports.guardarPassword = async (req, res) => {
    const usuarios = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    //no exite usuario o el token no existe

    if (!usuarios) {
        req.flash('error', 'El formulario ya no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }


    //guardar db y limpiar valores 

    usuarios.password = req.body.password;
    usuarios.token = undefined;
    usuarios.expira = undefined;

    //guardar db

    await usuarios.save();

    //redirigir

    req.flash('correcto', 'Password modificado Correctamente');
    res.redirect('/iniciar-sesion');



}