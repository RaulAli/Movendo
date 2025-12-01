const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug').default;

const EventoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
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
  id_merchant: {
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

EventoSchema.methods.updateFavoriteCount = async function () {
  const User = mongoose.model('User');
  const count = await User.countDocuments({ favouriteEvento: this._id });
  this.favouritesCount = count;
  await this.save();
  return this;
};




EventoSchema.methods.toEventoResponse = function (user) {
  return {
    _id: this._id, // Add this line
    slug: this.slug,
    nombre: this.nombre,
    description: this.description,
    startDate: this.startDate,
    endDate: this.endDate,
    ciudad: this.ciudad,
    price: this.price,
    image: this.image,
    category: this.category,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    id_merchant: this.id_merchant,
    favorited: user ? user.isFavorite(this._id) : false,
    favouritesCount: this.favouritesCount,
    comments: this.comments
  }
}

module.exports = mongoose.model('Evento', EventoSchema);
