const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug').default;

const EventoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  fecha: {
    type: String,
    required: [true, 'La fecha es obligatorio'],
    trim: true
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad es obligatorio'],
    trim: true
  },
  genero: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true,
    trim: true
  },
  image: {
    type: [String],
    required: true
  }
}, { timestamps: true });

EventoSchema.plugin(uniqueValidator, { message: '{PATH} already taken' });

async function generateSlug(doc) {//Slug Contra Duplicados (Create/Update)
  const base = slug(doc.nombre || 'evento', { lower: true });
  let candidate = base;
  let i = 0;

  while (await doc.constructor.exists({ slug: candidate })) {
    i++;
    candidate = `${base}-${i}`;
  }
  return candidate;
}

EventoSchema.pre('validate', async function (next) {
  try {
    if (!this.slug || this.isModified('nombre')) {
      this.slug = await generateSlug(this);
    }
    next();
  } catch (err) {
    next(err);
  }
});

EventoSchema.methods.toEventouctCarouselResponse = function () {
  return {
    image: this.image,
    slug: this.slug
  };
};



module.exports = mongoose.model('Evento', EventoSchema);
