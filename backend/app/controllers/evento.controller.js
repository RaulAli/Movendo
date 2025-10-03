const Evento = require('../models/evento.model');
const Category = require('../models/category.model');
function buildFilter(query) {
  const filter = {};

  if (query.q) {
    const regex = new RegExp(query.q, 'i');
    filter.$or = [{ nombre: regex }, { ciudad: regex }];
  }

  return filter;
}

exports.listar = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'fecha', order = 'asc' } = req.query;
    const filter = buildFilter(req.query);
    const skip = (Number(page) - 1) * Number(limit);

    const items = await Evento.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Evento.countDocuments(filter);

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
    const item = await Evento.findOne({ slug: req.params.slug });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const nuevo = new Evento(req.body);
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

    const evento = await Evento.findOne({ slug: req.params.slug });

    if (!evento) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    if (data.nombre && data.nombre !== evento.nombre) {
      evento.slug = null;
    }

    for (let key in data) {
      evento[key] = data[key];
    }

    if (newSlug) {
      evento.slug = newSlug;
    }

    const updated = await evento.save();

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
    const deleted = await Evento.findOneAndDelete({ slug: req.params.slug });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }
    res.json({ success: true, data: deleted });
  } catch (err) {
    next(err);
  }
};

exports.GetEventosByCategory = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 3;

    const [eventos, total] = await Promise.all([
      Evento.find({ slug_categoria: slug })
        .skip(offset)
        .limit(limit)
        .exec(),
      Evento.countDocuments({ slug_categoria: slug })
    ]);

    return res.status(200).json({
      success: true,
      eventos,
      evento_count: total
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};





