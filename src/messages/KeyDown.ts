import { boolean, guard, object, optional, string } from 'decoders';
import { Key } from '../Key';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

/**
 * A message used to request toasts to display
 * in the host application.
 * @external
 */
export interface LabeledKeyDown extends LabeledMsg {
  /** Message identifier */
  msgType: 'keyDown';
  /** Toast details */
  msg: Key;
}

/** @external */
const keyDownDecoder = guard(
  object({
    key: string,
    alt: optional(boolean),
    shift: optional(boolean),
    ctrl: optional(boolean)
  })
);

/** @external */
const validateKeyDown = createMessageValidator<LabeledKeyDown>(
  'keyDown',
  keyDownDecoder
);
export { validateKeyDown };
