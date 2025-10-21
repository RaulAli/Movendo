const Evento = require('../models/evento.model');
const User = require('../models/user.model');

exports.listar = async (req, res, next) => {
  try {
    // Helper function to safely get query parameters, handling arrays
    const getQueryParam = (paramName, defaultValue) => {
      const param = req.query[paramName];
      if (param === undefined || param === "undefined" || param === null || param === "") {
        return defaultValue;
      }
      // If it's an array, return it as is
      if (Array.isArray(param)) {
        return param;
      }
      // If it's a string, return it as is
      return param;
    };

    const limit = Number(getQueryParam('limit', 3));
    const offset = Number(getQueryParam('offset', 0));
    const category = getQueryParam('category', []); // Default to empty array
    const nombre = getQueryParam('nombre', "");
    const price_min = Number(getQueryParam('price_min', 0));
    const price_max = Number(getQueryParam('price_max', Number.MAX_SAFE_INTEGER));
    const startDate = getQueryParam('startDate', "");
    const endDate = getQueryParam('endDate', "");
    const ciudad = getQueryParam('ciudad', []); // Default to empty array

    const query = {
      $and: [{ price: { $gte: price_min } }, { price: { $lte: price_max } }],
    };

    let validDateRange = true;
    if (startDate !== "" && endDate !== "") {
      if (new Date(startDate) > new Date(endDate)) {
        validDateRange = false;
      }
    }

    if (validDateRange) {
      const queryStartDate = startDate !== "" ? new Date(startDate) : null;
      const queryEndDate = endDate !== "" ? new Date(endDate) : null;

      if (queryEndDate) {
        queryEndDate.setHours(23, 59, 59, 999);
      }

      if (queryStartDate) {
        query.$and.push({ startDate: { $gte: queryStartDate } });
      }

      if (queryEndDate) {
        query.$and.push({ endDate: { $lte: queryEndDate } });
      }
    }

    if (ciudad.length > 0) {
      query.ciudad = { $in: ciudad }; // Use $in for multiple cities
    }

    if (category.length > 0) {
      query.slug_category = { $in: category }; // Use $in for multiple categories
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
          startDate,
          endDate,
          ciudad,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const id = req.userId;
    const currentUser = id ? await User.findById(id).exec() : null;

    const evento = await Evento.findOne({ slug: req.params.slug })
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username image' }
      });

    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    if (evento.author) {
      const authorDoc = await User.findOne({ username: evento.author }).select('username image _id').lean();
      evento.author = authorDoc ? {
        id: authorDoc._id,
        username: authorDoc.username,
        image: authorDoc.image || null
      } : { username: evento.author };
    } else {
      evento.author = null;
    }
    return res.json({ success: true, data: await evento.toEventoResponse(currentUser) });
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const id = req.userId;
    const author = await User.findById(id).exec();
    if (!author) return res.status(401).json({ message: 'User Not Found' });

    const nuevo = new Evento(req.body);
    nuevo.author = author._id;
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

exports.getUniqueCities = async (req, res, next) => {
  try {
    const cities = await Evento.distinct('ciudad');
    return res.status(200).json({
      success: true,
      data: cities
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.getMinMaxPrices = async (req, res, next) => {
  try {
    const category = req.query.category;
    let pipeline = [];

    if (category) {
      pipeline.push({ $match: { slug_category: category } });
    }

    pipeline.push({ $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } });

    const result = await Evento.aggregate(pipeline);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        data: { minPrice: result[0].minPrice, maxPrice: result[0].maxPrice }
      });
    } else {
      // If no events match the category, return default min/max
      return res.status(200).json({
        success: true,
        data: { minPrice: 0, maxPrice: 0 }
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.addfavoriteEvento = async (req, res, next) => {
  try {
    const id = req.userId;
    const { slug } = req.params;

    const [loginUser, evento] = await Promise.all([
      User.findById(id).exec(),
      Evento.findOne({ slug }).exec()
    ]);

    if (!loginUser) return res.status(401).json({ message: 'User Not Found' });
    if (!evento) return res.status(404).json({ message: 'Evento Not Found' });

    const updatedUser = await loginUser.favorite(evento._id);
    const updatedEvento = await evento.updateFavoriteCount();

    return res.status(200).json({
      success: true,
      data: await updatedEvento.toEventoResponse(updatedUser)
    });
  } catch (err) {
    next(err);
  }
};

exports.unfavoriteEvento = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { slug } = req.params;

    const [user, evento] = await Promise.all([
      User.findById(userId).exec(),
      Evento.findOne({ slug }).exec()
    ]);

    if (!user) return res.status(401).json({ message: 'User Not Found' });
    if (!evento) return res.status(404).json({ message: 'Evento Not Found' });

    const updatedUser = await user.unfavorite(evento._id);
    const updated = await evento.updateFavoriteCount();

    return res.status(200).json({
      success: true,
      data: await updated.toEventoResponse(updatedUser)
    });
  } catch (err) {
    next(err);
  }
};


// #region OLD OBTENER METHOD
// exports.obtener = async (req, res, next) => {
//   try {
//     const id = req.userId;
//     const user = id ? await User.findById(id).exec() : null;
//     const evento = await Evento.findOne({ slug: req.params.slug })
//       .populate({
//         path: 'comments',
//         populate: {
//           path: 'author',
//           select: 'username image'
//         }
//       });

//     if (!evento) {
//       return res.status(404).json({ success: false, message: 'Evento no encontrado' });
//     }

//     return res.json({ success: true, data: await evento.toEventoResponse(user) });
//   } catch (err) {
//     next(err);
//   }
// };