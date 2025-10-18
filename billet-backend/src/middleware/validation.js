const { body,  validation, validationResult} = require('express-validator');
const supabase = require('../config/database');


const validateSellerCreation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Seller name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters.')
        .escape(),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email is required')
        .normalizeEmail()
        .custom( async (email) =>{
            const { data: existingSeller } = await supabase
                .from('sellers')
                .select('id')
                .eq('email', email)
                .single();

            if (existingSeller) {
                throw new Error('Seller already exists');
            }
            return true
        }),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8})
        .withMessage('Password must be at least 8 characters.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)$/)
        .withMessage('Password must contain at least one lowercase, one uppercase, and a one number'),

    body('quote')
        .optional()
        .isInt({ min: 1, max: 300 })
        .withMessage('Quote must be a number between 1 to 300'),
    body('username')
        .trim()
        .isString()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 4, max: 50 })
        .withMessage('Username must be between 4 and 10 characters.')
        .custom( async (username) =>{
            const { data: existingSeller } = await supabase
                .from('sellers')
                .select('id')
                .eq('username', username)
                .single();
            if (existingSeller) {
                throw new Error('Username already taken');
            }
            return true
        })
];

const handleValidationError = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: false,
            message: 'Validation failed.',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value,
            }))
        })
    }
    next();
}

const validateSellerUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({min: 2, max: 100})
        .withMessage('Name must be between 2 and 100 characters.')
        .escape(),

    body('quota')
        .optional()
        .trim()
        .isLength({min: 1, max: 300})
        .withMessage('Quota must be a number between 1 to 300.'),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Active must be true or false')
]



const validateGenerateTicket = [
    body('buyerName')
        .notEmpty().withMessage('Buyer name is required')
        .isLength({ min: 2 }).withMessage('Buyer name must be at least 2 characters'),
    
    body('buyerPhone')
        .notEmpty().withMessage('Buyer phone is required')
        .isMobilePhone().withMessage('Valid phone number is required'),
    
    body('buyerEmail')
        .optional()
        .isEmail().withMessage('Valid email is required'),
    
    body('ticketPrice') // ✅ Add ticket price validation
        .notEmpty().withMessage('Ticket price is required')
        .isFloat({ min: 0 }).withMessage('Ticket price must be a positive number')
];


module.exports = {
    validateSellerUpdate,
    handleValidationError,
    validateSellerCreation,
    validateGenerateTicket
}