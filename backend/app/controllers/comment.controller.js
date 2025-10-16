const asyncHandler = require('express-async-handler');
const Comment = require('../models/comment.model');
const Evento = require('../models/evento.model');
const User = require('../models/user.model');

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

    const comment = await Comment.create({
        body: body.trim(),
        author: author._id,
        evento: evento._id
    });

    return res.status(201).json({
        comment: await comment.toCommentResponse(author)
    });
});
