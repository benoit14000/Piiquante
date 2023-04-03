const joi = require("joi");

const validation = joi.object({
	email: joi.string().email().trim(true).required(),
	password: joi.string().min(7).trim(true).required(),
});



const userValidation = async (req, res, next) => {
	const payload = {
		email: req.body.email,
		password: req.body.password,
	};
	const { error } = validation.validate(payload);
	if (error) {
		res.status(406).json({ message: `Error in User Data : ${error.message}` });
	} else {
		next();
	}
};
module.exports = userValidation;