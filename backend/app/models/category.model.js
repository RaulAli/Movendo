const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug').default;

const CategorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    default: '',
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  }
}, { timestamps: true });

CategorySchema.plugin(uniqueValidator, { message: '{PATH} ya existe' });

async function generateSlug(doc) {
  const base = slug(doc.nombre || 'categoria', { lower: true });
  let candidate = base;
  let i = 0;

  while (await doc.constructor.exists({ slug: candidate })) {
    i++;
    candidate = `${base}-${i}`;
  }
  return candidate;
}

CategorySchema.pre('validate', async function (next) {
  try {
    if (!this.slug || this.isModified('nombre')) {
      this.slug = await generateSlug(this);
    }
    next();
  } catch (err) {
    next(err);
  }
});

CategorySchema.methods.toCategoryCarouselResponse = function () {
  return {
    nombre: this.nombre,
    image: this.image,
    slug: this.slug
  };
};


module.exports = mongoose.model('Category', CategorySchema);
