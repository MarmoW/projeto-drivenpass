import Joi from 'joi';
import { CreateNetworkParams  } from '@/services/networks-service';

export const newNetworkSchema = Joi.object<CreateNetworkParams >({
    title: Joi.string().required(),
    network: Joi.string().required(),
    password: Joi.string().required()
})