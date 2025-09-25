const Category = require('../models/category.model');
const Evento = require('../models/evento.model');

const get_carousel_category = async (req, res, next) => {
    try {
        const category = await Category.find();

        if (!category || category.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({
            category: category.map((cat) => cat.toCategoryCarouselResponse()),
        });
    } catch (err) {
        next(err);
    }
};

const get_carousel_evento = async (req, res, next) => {
    try {
        const { slug } = req.params;

        if (!slug || typeof slug !== 'string' || !slug.trim()) {
            return res.status(400).json({ message: 'Missing or invalid evento slug' });
        }

        const evento = await Evento.findOne({ slug: slug.trim().toLowerCase() });

        if (!evento) {
            return res.status(404).json({ message: 'Evento not found' });
        }

        res.status(200).json({
            evento: evento.toEventouctCarouselResponse(),
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    get_carousel_category,
    get_carousel_evento,
};
