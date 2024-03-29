import Joi from "joi";

const usersValidator = (data) => {
  const schema = Joi.object({
    id: Joi.string().min(4).required(),
    password: Joi.string().min(1).required(),
    userType: Joi.string().min(1),
    point: Joi.string().min(1),
    status: Joi.string().min(1),
  });

  return schema.validate(data)
};

export default usersValidator;