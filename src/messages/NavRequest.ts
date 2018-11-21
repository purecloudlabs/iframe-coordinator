import { guard, object, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

/**
 * The navigation request data.
 */
export interface NavRequest {
  url: string;
}

/**
 * A message used to indicate a navigation operation
 * has been requested.
 */
const navRequestDecoder = guard(
  object({
    url: string
  })
);

/**
 * A message used to request the host navigate to another
 * URI.
 */
export interface LabeledNavRequest extends LabeledMsg {
  msgType: 'navRequest';
  clientId: string;
  msg: NavRequest;
}

const validateNavRequest = createMessageValidator<LabeledNavRequest>(
  'navRequest',
  navRequestDecoder
);
export { validateNavRequest };
