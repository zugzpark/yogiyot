import Joi from "joi";

const telRegex = /^\d{2,5}-\d{1,4}-\d{4}$/;

const restaurantsValidator = (data) => {
  const schema = Joi.object({
    brandName: Joi.string().min(2),
    address: Joi.string().min(1),
    tel: Joi.string().pattern(telRegex).required(),
    type: Joi.string().min(1),
  });

  return schema.validate(data)
};

export default restaurantsValidator;