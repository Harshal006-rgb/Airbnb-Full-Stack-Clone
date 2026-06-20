const Joi = require("joi");      //For Server Side / Schema Validation
// https://joi.dev/ 

module.exports = {
    listingSchema: Joi.object({
        listing: Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().allow("" , null),
            price: Joi.number().required(),
            location: Joi.string().required(),
            country: Joi.string().required(),
        }).required()
    })
};