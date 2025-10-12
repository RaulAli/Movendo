const Evento = require('../models/evento.model');

exports.listar = async (req, res, next) => {
  try {
    const transUndefined = (varQuery, otherResult) =>
      varQuery != "undefined" && varQuery ? varQuery : otherResult;

    const limit = Number(transUndefined(req.query.limit, 3));
    const offset = Number(transUndefined(req.query.offset, 0));
    const category = transUndefined(req.query.category, "");
    const nombre = transUndefined(req.query.nombre, "");
    const price_min = Number(transUndefined(req.query.price_min, 0));
    const price_max = Number(transUndefined(req.query.price_max, Number.MAX_SAFE_INTEGER));

    const query = {
      $and: [{ price: { $gte: price_min } }, { price: { $lte: price_max } }],
    };

    if (category !== "") {
      const categories = category.split(",");
      query.slug_category = { $in: categories };
    }

    if (nombre !== "") {
      query.nombre = { $regex: nombre, $options: 'i' };
    }


    const eventos = await Evento.find(query).limit(limit).skip(offset);
    const evento_count = await Evento.countDocuments(query);

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron eventos con los filtros aplicados",
        data: [],
        meta: {
          total: 0,
          limit,
          offset,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Eventos cargados correctamente",
      data: eventos,
      meta: {
        total: evento_count,
        limit,
        offset,
        filters: {
          category,
          price_min,
          price_max,
        },
      },
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
    const limit = parseInt(req.query.limit) || 10;

    const [eventos, total] = await Promise.all([
      Evento.find({ slug_category: slug })
        .skip(offset)
        .limit(limit)
        .exec(),
      Evento.countDocuments({ slug_category: slug })
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





