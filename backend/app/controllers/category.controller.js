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
    const { page = 1, limit = 10, sortBy = 'nombre', order = 'asc' } = req.query;
    const filter = buildFilter(req.query);
    const skip = (Number(page) - 1) * Number(limit);

    const items = await Category.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments(filter);

    res.json({
      success: true,
      data: items,
      meta: { total, page: Number(page), limit: Number(limit) }
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
    const categoria = await Category.findOne({ slug: req.params.slug });

    if (!categoria) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    if (data.nombre && data.nombre !== categoria.nombre) {
      categoria.slug = null;
    }

    for (let key in data) {
      categoria[key] = data[key];
    }

    if (newSlug) {
      categoria.slug = newSlug;
    }

    const updated = await categoria.save();
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
