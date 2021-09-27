const mongoose = require("mongoose");
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortId = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        img: req.user.imagen,
        tagline: 'Llena el formulario y publica tu vacante',

    });
}


//AGREGAR VACANTES A LA BD
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    //usuario autor
    vacante.autor = req.user._id;


    //crear arreglo de skills

    vacante.skills = req.body.skills.split(',');


    //ALACENARLO EN LA DB

    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);


}

//muestra una vacante

exports.mostrarVacante = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor');

    //si no hay resultados
    if (!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true,

    });
}

exports.formEditarVacante = async (req, res, next) => {

    const vacante = await Vacante.findOne({ url: req.params.url });

    if (!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar- ${vacante.titulo}`,
        cerrarSesion: true,
        img: req.user.imagen,
        nombre: req.user.nombre,
    })

}


exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({ url: req.params.url }, vacanteActualizada, {
        new: true,
        runValidators: true,

    });

    res.redirect(`/vacantes/${vacante.url}`);


}



//validar y sanitisar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
    //sanitisar
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();


    //validar 
    req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
    req.checkBody('contrato', 'Selecciona el Tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores = req.validationErrors();

    if (errores) {
        //recargar la vista con los errores de la pag
        req.flash('error', errores.map(error => error.msg));

        res.render('nueva-vacante', {

            nombrePagina: 'Nueva Vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            tagline: 'Llena el formulario y publica tu vacante',
            mensajes: req.flash(),

        })

    }

    next();
}

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;
    const vacante = await Vacante.findById(id);
    if (verificarAutor(vacante, req.user)) {
        //TODO BIEN SI ES EL USUARIO
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');

    } else {
        //No perimitido
        res.status(403).send('error');
    }

}

const verificarAutor = (vacante = {}, usuario = {}) => {

    if (!vacante.autor.equals(usuario._id)) {
        return false;
    }

    return true;

}


//subir archivoos en pdf
exports.subirCv = (req, res, next) => {
    upload(req, res, function (error) {

        if (error) {


            if (error instanceof multer.MulterError) {

                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'La imagen es muy grande, maximo 100 KB');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }

            res.redirect('back');
            return;

        } else {
            return next();
        }


    });

}


const configuracionMulter = {
    limits: { fileSize: 500000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortId.generate()}.${extension}`);
        }

    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            //el collback se ejecuta como true or false
            cb(null, true);
        } else {
            cb(new Error('Formato no Válido'));

        }

    },

}


const upload = multer(configuracionMulter).single('cv');


exports.contactar = async (req, res, next) => {
    //almacenar los candidatos en el DB
    const vacante = await Vacante.findOne({ url: req.params.url });

    //si no existe la vacante
    if (!vacante) return next();

    //todo bien, construir nuevo objeto con
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    };


    //almacenar vacante del
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensajes
    req.flash('correcto', 'Se envio tu CV correctamente');
    res.redirect('/');
}


exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);


    if (vacante.autor != req.user._id.toString()) return next();


    if (!vacante) return next();


    res.render('candidatos', {
        nombrePagina: `Candidatos vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        img:req.user.imagen,
        candidatos:vacante.candidatos,
    })

}

//buscador vacantes

exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text:
        {
            $search: req.body.q,

        }
    })
    
    res.render('home', {
        nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}
