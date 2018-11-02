import { guard, object, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

export interface NavRequest {
  url: string;
}

const navRequestDecoder = guard(
  object({
    url: string
  })
);

export interface LabeledNavRequest extends LabeledMsg {
  msgType: 'navRequest';
  msg: NavRequest;
}

const validateNavRequest = createMessageValidator<LabeledNavRequest>(
  'navRequest',
  navRequestDecoder
);
export { validateNavRequest };
