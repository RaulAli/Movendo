const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug').default;

const EventoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  description: {  // <--- NUEVO: Agregar este campo que falta
    type: String,
    trim: true,
    default: ''
  },
  startDate: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria'],
  },
  endDate: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria'],
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad es obligatorio'],
    trim: true
  },
  category: {
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
  },
  slug_category: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    required: true
  },
  favouritesCount: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  author: {
    type: String,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ["PUBLISHED", "UNPUBLISHED"],
    default: "PUBLISHED"
  },
  stock: {
    type: Number,
    default: 0
  },
  id_merchant: {
    type: [String],
    required: true
  },

  // **CAMPOS RAG - AGREGADOS**
  embedding: {
    type: [Number],
    default: null,
    index: true
  },
  embeddingUpdatedAt: {  // <--- IMPORTANTE: Para saber cuando se actualizó
    type: Date,
    default: null
  }

}, { timestamps: true });

// Índice de texto CORREGIDO (ahora incluye 'description' que sí existe)
EventoSchema.index({
  nombre: 'text',
  ciudad: 'text',
  category: 'text',
  description: 'text'
}, {
  name: 'text_search_index',
  weights: {
    nombre: 10,
    category: 5,
    ciudad: 3,
    description: 1
  },
  default_language: 'spanish'
});

// Índice adicional para búsquedas comunes
EventoSchema.index({ isActive: 1, startDate: 1 });
EventoSchema.index({ ciudad: 1, startDate: 1 });
EventoSchema.index({ slug_category: 1, startDate: 1 });

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

// **MÉTODO NUEVO: Para generar texto para embedding**
EventoSchema.methods.getTextForEmbedding = function () {
  return `
    ${this.nombre || ''}
    ${this.category || ''}
    ${this.ciudad || ''}
    ${this.description || ''}
    ${this.slug_category?.join(' ') || ''}
  `.trim().replace(/\s+/g, ' ');
};

// **MÉTODO NUEVO: Para verificar si necesita actualizar embedding**
EventoSchema.methods.needsEmbeddingUpdate = function () {
  return !this.embedding ||
    !this.embeddingUpdatedAt ||
    this.embeddingUpdatedAt < this.updatedAt;
};

EventoSchema.methods.toEventoCarouselResponse = function () {  // <--- CORREGIDO TYPO
  return {
    image: this.image,
    slug: this.slug
  };
};

EventoSchema.methods.updateFavoriteCount = async function () {
  const User = mongoose.model('User');
  const count = await User.countDocuments({ favouriteEvento: this._id });
  this.favouritesCount = count;
  await this.save();
  return this;
};

EventoSchema.methods.toEventoResponse = function (user) {
  return {
    _id: this._id,
    slug: this.slug,
    nombre: this.nombre,
    description: this.description,  // <--- AHORA SÍ EXISTE
    startDate: this.startDate,
    endDate: this.endDate,
    ciudad: this.ciudad,
    price: this.price,
    image: this.image,
    category: this.category,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    id_merchant: this.id_merchant,  // <--- SOLO UNA VEZ (sin duplicado)
    favorited: user ? user.isFavorite(this._id) : false,
    favouritesCount: this.favouritesCount,
    comments: this.comments,
    stock: this.stock,
  }
}

module.exports = mongoose.model('Evento', EventoSchema);