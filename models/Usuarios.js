const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');


const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    token: String,
    expira: Date,
    imagen: String,
});

//HASHEAR LOS PASSWORDS

usuarioSchema.pre('save', async function (next) {
    //Si el pass ya esta hasheado no se hace nada
    if (!this.isModified('password')) {
        return next(); ///deter ejecucion
    }

    //si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});
//ENVIA ALERTA CUANDO UN USUARIO YA ESTA REGISTRADO
usuarioSchema.post('save', function(error, doc, next) {
      if(error.name === 'MongoError' &&  error.code === 11000){
          next('Ese correo ya existe');
      }else{
          next(error);
      }
});

//AUTENTICAR USUARIOS
usuarioSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuarioSchema);