import Joi from "joi";

const menusValidator = (data) => {
  const schema = Joi.object({
    menuName: Joi.string().min(1),
    image: Joi.string().min(1),
    price: Joi.string().min(1),
    type: Joi.string().min(1),
  });

  return schema.validate(data)
};

export default menusValidator;