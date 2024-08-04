const Joi = require('joi');

exports.sendMessageValidation = Joi.object({
    receiver: Joi.string().required(),
    text: Joi.string().optional(),
    parent: Joi.string().optional()

});

