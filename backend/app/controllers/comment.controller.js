const asyncHandler = require('express-async-handler');
const Comment = require('../models/comment.model');
const Evento = require('../models/evento.model');
const User = require('../models/user.model');

// controllers/comment.controller.js
exports.createCommentForEvento = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { slug } = req.params;
    const { body } = req.body?.comment || {};

    if (!body || !body.trim()) {
        return res.status(422).json({ message: 'El comentario es obligatorio' });
    }

    const [author, evento] = await Promise.all([
        User.findById(userId).exec(),
        Evento.findOne({ slug }).select('_id').exec()
    ]);

    if (!author) return res.status(401).json({ message: 'User Not Found' });
    if (!evento) return res.status(404).json({ message: 'Evento Not Found' });

    const existingComment = await Comment.findOne({
        author: author._id,
        evento: evento._id
    }).exec();

    if (existingComment) {
        return res.status(409).json({
            message: 'Agradecemos sus intenciones pero por temas de seguridad solo se permite un commentario por usuario.'
        });
    }

    const comment = await Comment.create({
        body: body.trim(),
        author: author._id,
        evento: evento._id
    });

    return res.status(201).json({
        comment: await comment.toCommentResponse(author)
    });
});

exports.getCommentFromEvento = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const evento = await Evento.findOne({ slug }).select('_id').exec();

    if (!evento) return res.status(404).json({ message: 'Evento Not Found' });

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
        Comment.find({ evento: evento._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: 'author', model: 'User', select: '_id username image' })
            .exec(),
        Comment.countDocuments({ evento: evento._id })
    ]);

    const comments = rows.map(c => ({
        id: c._id,
        body: c.body,
        createdAt: c.createdAt,
        author: c.author ? {
            id: c.author._id,
            username: c.author.username,
            image: c.author.image
        } : undefined
    }));

    res.status(200).json({ comments, total, page, limit });
});

exports.deleteCommentFromEvento = asyncHandler(async (req, res) => {
    const { slug, id } = req.params;
    const userId = req.userId;

    const [evento, comment] = await Promise.all([
        Evento.findOne({ slug }).select('_id').exec(),
        Comment.findById(id).exec()
    ]);

    if (!evento) return res.status(404).json({ message: 'Evento Not Found' });
    if (!comment) return res.status(404).json({ message: 'Comment Not Found' });

    if (String(comment.evento) !== String(evento._id)) {
        return res.status(400).json({ message: 'Comment does not belong to this event' });
    }

    if (String(comment.author) !== String(userId)) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({
        message: 'Comment deleted successfully',
        deleted: {
            id: comment._id,
            body: comment.body,
            evento: evento._id,
            author: comment.author
        }
    });
});

exports.updateComment = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { slug, id } = req.params;
    const { body } = req.body?.comment || {};

    if (!body || !body.trim()) {
        return res.status(422).json({
            message: 'El comentario no puede estar vacío'
        });
    }

    const [evento, comment] = await Promise.all([
        Evento.findOne({ slug }).select('_id').exec(),
        Comment.findById(id).populate('author', 'username _id').exec()
    ]);

    if (!evento) {
        return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (!comment) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    if (String(comment.evento) !== String(evento._id)) {
        return res.status(400).json({
            message: 'El comentario no pertenece a este evento'
        });
    }

    if (String(comment.author._id) !== String(userId)) {
        return res.status(403).json({
            message: 'No estás autorizado para editar este comentario'
        });
    }

    comment.body = body.trim();
    comment.updatedAt = new Date();

    await comment.save();

    return res.status(200).json({
        comment: await comment.toCommentResponse(comment.author)
    });
});