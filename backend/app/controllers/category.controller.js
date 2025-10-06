const Category = require('../models/category.model');

function buildFilter(query) {
  const filter = {};

  if (query.q) {
    const regex = new RegExp(query.q, 'i');
    filter.$or = [{ nombre: regex }, { descripcion: regex }];
  }

  return filter;
}

exports.listar = async (req, res, next) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 0;

    const category = await Category.find({}, {}, { skip: Number(offset), limit: Number(limit) });

    if (!category) {
      return res.status(401).json({
        message: "Category no encontrada"
      })
    }
    return res.status(200).json({
      success: true,
      category: category,
    });

  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const item = await Category.findOne({ slug: req.params.slug });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const nuevo = new Category(req.body);
    const saved = await nuevo.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { slug: newSlug, ...data } = req.body;
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    if (data.nombre && data.nombre !== category.nombre) {
      category.slug = null;
    }

    for (let key in data) {
      category[key] = data[key];
    }

    if (newSlug) {
      category.slug = newSlug;
    }

    const updated = await category.save();
    res.json({ success: true, data: updated });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    next(err);
  }
};

exports.borrar = async (req, res, next) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    res.json({ success: true, data: deleted });
  } catch (err) {
    next(err);
  }
};
