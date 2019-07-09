import { boolean, guard, number, object, optional, string } from 'decoders';
import { NativeKey } from '../Key';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

/**
 * A message used to send key information
 * to the host application.
 * @external
 */
export interface LabeledKeyDown extends LabeledMsg {
  /** Message identifier */
  msgType: 'keyDown';
  /** Key details */
  msg: NativeKey;
}

/** @external */
const keyDownDecoder = guard(
  object({
    altKey: optional(boolean),
    charCode: optional(number),
    code: optional(string),
    ctrlKey: optional(boolean),
    key: string,
    keyCode: optional(number),
    metaKey: optional(boolean),
    shiftKey: optional(boolean)
  })
);

/** @external */
const validateKeyDown = createMessageValidator<LabeledKeyDown>(
  'keyDown',
  keyDownDecoder
);
export { validateKeyDown };
