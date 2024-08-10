const Joi = require('joi');
const { ROLES } = require('../utils/constants');

// const Joi = require('joi');


exports.addOrRemoveFollowingValidation = Joi.object({
    followingId: Joi.string().required().messages({
        'any.required': 'Following ID is required.'
    })
});


exports.categoryValidation = Joi.object({
  title: Joi.string().required(),
//   description: Joi.string().required(),
});

exports.packageValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    products: Joi.array().items(Joi.string().allow(null)).default(null),
    media: Joi.array().items(Joi.string().allow(null)).default(null),
  });

exports.registerUserValidation = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Name is required.',
        'string.empty': 'Name cannot be empty.'
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required.',
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Please enter a valid email.'
    }),
    password: Joi.string().min(5).max(30).required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must be at least 8 characters'
    }),
    role: Joi.string().valid(ROLES.TENANT, ROLES.ADMIN, ROLES.OWNER).default(ROLES.TENANT),
    deviceToken: Joi.string().optional()
}).messages({
    'object.unknown': 'Invalid field {#label}'
});

exports.loginUserValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required.',
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Email must be a valid email address.'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.'
    }),
    device_token: Joi.string().required().messages({
        'any.required': 'Device token is required.'
    })
});

exports.resetPasswordValidation = Joi.object({
    password: Joi.string().min(5).max(30).required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least 5 characters long.',
        'string.max': 'Password must be less than or equal to 5 characters long.'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.required': 'Confirm password is required.',
        'any.only': 'Passwords must match.'
    })
});


exports.productValidation = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  productType: Joi.string().required(),
  sku: Joi.string().allow(null, ''),
  brandName: Joi.string().allow(null),
  category: Joi.string().allow(null),
  price: Joi.number().allow(null)
});

exports.addPropertyValidation = Joi.object({
    title: Joi.string().allow(null),
    price: Joi.string().allow(null),
    description: Joi.string().allow(null),
    Bedrooms: Joi.string().allow(null),
    Bathrooms: Joi.string().allow(null),
    size: Joi.string().allow(null),
    parking: Joi.string().allow(null),
    farnished: Joi.string().allow(null),
    longitude: Joi.number().allow(null),
    latitude: Joi.number().allow(null),
    city: Joi.string().allow(null),
    address: Joi.string().allow(null),
    property_type: Joi.string().allow(null),
});

exports.updatePropertyValidation = Joi.object({
    title: Joi.string().allow(null, '').optional(),
    price: Joi.string().allow(null, '').optional(),
    description: Joi.string().allow(null, '').optional(),
    Bedrooms: Joi.string().allow(null, '').optional(),
    Bathrooms: Joi.string().allow(null, '').optional(),
    size: Joi.string().allow(null, '').optional(),
    parking: Joi.string().allow(null, '').optional(),
    farnished: Joi.string().allow(null, '').optional(),
    longitude: Joi.string().allow(null, '').optional(),
    latitude: Joi.string().allow(null, '').optional(),
    city: Joi.string().allow(null, '').optional(),
    location: Joi.string().allow(null, '').optional(),
    property_type: Joi.string().allow(null, '').optional(),
    propertyId:Joi.string().required().messages({
        'any.required': 'PropertyId is required.',

    }),
    deleteImages: Joi.array()
});

exports.IsNotificationValidator = Joi.object({
    isNotification: Joi.boolean().required()
  })
  
exports.updateProfileValidation = Joi.object({
    full_name: Joi.string().allow('', null).messages({
        'string.empty': 'Full name cannot be empty.'
    }),
    phone_number: Joi.string().required().messages({
        'any.required': 'Phone number is required.',
        'string.max': 'Phone number must be between 8 to 15 digits',
        'string.min': 'Phone number must be between 8 to 15 digits'
    }),
    facebook: Joi.string().allow('', null),
    instagram: Joi.string().required().allow('', null).messages({
        'any.required': 'Instagram is required.'
    }),
    location: Joi.string().required().allow('', null).messages({
        'any.required': 'Location is required.'
    }),
    longitude: Joi.string().required().allow('', null).messages({
        'any.required': 'Longitude is required.'
    }),
    latitude: Joi.string().required().allow('', null).messages({
        'any.required': 'Latitude is required.'
    }),
    bio: Joi.string().required().allow('', null).messages({
        'any.required': 'Bio is required.'
    }),
    profile_image: Joi.string().allow('', null),
    ssn_image: Joi.string().allow('', null)
});
//     followingId: Joi.string().required(),
// });

// exports.registerUserValidation = Joi.object({
//     name: Joi.string().required().messages({
//         'any.required': 'Name is required.',
//         'string.empty': 'Name cannot be empty.',
//     }),
//     email: Joi.string().email().required().messages({
//         'any.required': 'Email is required.',
//         'string.empty': 'Email cannot be empty.',
//         'string.email': 'Email must be a valid email address.',
//     }),
//     password: Joi.string().min(5).max(30).required().messages({
//         'any.required': 'Password is required.',
//         'string.empty': 'Password cannot be empty.',
//         'string.min': 'Password must be at least {#limit} characters long.',
//         'string.max': 'Password must be less than or equal to {#limit} characters long.',
//     }),
//     dob: Joi.date(),
//     role: Joi.string().valid(ROLES.TENANT, ROLES.ADMIN, ROLES.OWNER).default(ROLES.TENANT),
//     deviceToken: Joi.string().optional(),
// });


// exports.loginUserValidation = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//     device_token: Joi.string().required(),
// });

// exports.resetPasswordValidation = Joi.object({
//     password: Joi.string().min(5).max(30).required(),
//     confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
// });
// exports.addPropertyValidation = Joi.object({
//     title: Joi.string().allow(null),
//     price: Joi.string().allow(null),
//     description: Joi.string().allow(null),
//     Bedrooms: Joi.string().allow(null),
//     Bathrooms: Joi.string().allow(null),
//     size: Joi.number().allow(null),
//     parking: Joi.string().allow(null),
//     farnished: Joi.number().allow(null),
//     longitude: Joi.string().allow(null),
//     latitude: Joi.string().allow(null),
//     sector_latitude: Joi.number().allow(null),
//     sector_longitude: Joi.number().allow(null),
//     city: Joi.string().allow(null),
//     location: Joi.string().allow(null),
//     property_type: Joi.string().allow(null),
//     tier: Joi.string().allow(null),
//     sector: Joi.string().allow(null)
// });

// exports.updatePropertyValidation = Joi.object({
//     title: Joi.string().allow(null),
//     price: Joi.string().allow(null),
//     description: Joi.string().allow(null),
//     Bedrooms: Joi.string().allow(null),
//     Bathrooms: Joi.string().allow(null),
//     size: Joi.number().allow(null),
//     parking: Joi.string().allow(null),
//     farnished: Joi.number().allow(null),
//     longitude: Joi.string().allow(null),
//     latitude: Joi.string().allow(null),
//     sector_latitude: Joi.number().allow(null),
//     sector_longitude: Joi.number().allow(null),
//     city: Joi.string().allow(null),
//     location: Joi.string().allow(null),
//     property_type: Joi.string().allow(null),
//     tier: Joi.string().allow(null),
//     sector: Joi.string().allow(null)
// });

// exports.updateProfileValidation = Joi.object({
//     full_name: Joi.string().allow('', null),
//     phone_number: Joi.string().required(),
//     facebook: Joi.string().allow('', null),
//     instagram: Joi.string().required().allow('', null),
//     location: Joi.string().required().allow('', null),
//     longitude: Joi.string().required().allow('', null),
//     latitude: Joi.string().required().allow('', null),
//     bio: Joi.string().required().allow('', null),
//     userId: Joi.string().required()
// });