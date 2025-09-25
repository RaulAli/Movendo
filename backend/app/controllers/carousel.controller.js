const Category = require('../models/category.model');
const Product = require('../models/prod.model');

const get_carousel_categories = async (req, res, next) => {
    try {
        const categories = await Category.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: 'Categories not found' });
        }

        res.status(200).json({
            categories: categories.map((cat) => cat.toCategoryCarouselResponse()),
        });
    } catch (err) {
        next(err);
    }
};

const get_carousel_product = async (req, res, next) => {
    try {
        const { slug } = req.params;

        if (!slug || typeof slug !== 'string' || !slug.trim()) {
            return res.status(400).json({ message: 'Missing or invalid product slug' });
        }

        const product = await Product.findOne({ slug: slug.trim().toLowerCase() });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            product: product.toProductCarouselResponse(),
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    get_carousel_categories,
    get_carousel_product,
};
