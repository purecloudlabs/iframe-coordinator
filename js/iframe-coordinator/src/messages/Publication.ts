import { guard, mixed, object, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

export interface Publication {
  topic: string;
  payload: any;
}

export interface LabeledPublication extends LabeledMsg {
  msgType: 'publish';
  msg: Publication;
}

const publicationDecoder = guard(
  object({
    topic: string,
    payload: mixed
  })
);

const validatePublication = createMessageValidator<LabeledPublication>(
  'publish',
  publicationDecoder
);
export { validatePublication };
