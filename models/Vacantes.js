const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//generador de URLS
const slug = require('slug');
//generador de ID
const shortId = require('shortid');


//DEFINIENDO EL MODELO

const vacantesShema = new mongoose.Schema({
   titulo:{
       type:String,
       require: 'El nonmbre de la vacante es obligatorio',
       trim: true
   },
   empresa:{
       type: String,
       trim: true,
   },

   ubicacion:{
       type:String,
       trim:true,
       require: 'La ubicación es obligatoria',
   },
   salario:{
       type: String,
       default: 0,
       trim: true,
   },

   contrato:{
       type: String,
       trim: true,
   },

   descripcion:{
       type: String,
       trim: true,
   },

   url:{
       type:String,
       lowercase:true,

   },
    skills: [String],
    candidatos:[{
        nombre: String,
        email: String,
        cv: String,
    }],
    autor:{
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required:'El autor es obligatorio'
    }

});
vacantesShema.pre('save', function(next){
    const url = slug(this.titulo);
    this.url = `${url}-${shortId.generate()}`
    next()
})
vacantesShema.index({'$**': 'text'});
module.exports = mongoose.model('Vacante',vacantesShema);