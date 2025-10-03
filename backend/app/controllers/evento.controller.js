const Evento = require('../models/evento.model');
const Category = require('../models/category.model');

exports.listar = async (req, res, next) => {
  try {
    let query = {};
    let transUndefined = (varQuery, otherResult) => {
      return varQuery != "undefined" && varQuery ? varQuery : otherResult;
    };

    let limit = transUndefined(req.query.limit, 3); // Cantidad de productos al SHOP
    let offset = transUndefined(req.query.offset, 0);
    let category = transUndefined(req.query.category, "");
    // let name = transUndefined(req.query.name, "");
    let price_min = transUndefined(req.query.price_min, 0);
    let price_max = transUndefined(req.query.price_max, Number.MAX_SAFE_INTEGER);
    // let nameReg = new RegExp(name, "i");

    query = {
      // name: { $regex: nameReg },
      $and: [{ price: { $gte: price_min } }, { price: { $lte: price_max } }],
    };

    if (category !== "") {
      query.category = category; /// que quiero Filtrar
    }
    console.log
    const eventos = await Evento.find(query)
      .limit(Number(limit))
      .skip(Number(offset));
    const evento_count = await Evento.countDocuments(query);

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No se encontraron eventos con los filtros aplicados",
      });
    }

    return res.status(200).json({
      success: true,
      eventos: await Promise.all(
        eventos.map(async (evento) => {
          return evento;
        })
      ),
      evento_count: evento_count,
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





