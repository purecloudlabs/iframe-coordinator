import {
  boolean,
  constant,
  Decoder,
  number,
  object,
  optional,
  string
} from 'decoders';
import { NativeKey } from '../Key';
import { labeledDecoder, LabeledMsg } from './LabeledMsg';

/**
 * A message used to send key information
 * to the host application.
 * @external
 */
export interface LabeledKeyDown
  extends LabeledMsg<'registeredKeyFired', NativeKey> {
  /** Message identifier */
  msgType: 'registeredKeyFired';
  /** Key details */
  msg: NativeKey;
}

/** @external */
const decoder: Decoder<LabeledKeyDown> = labeledDecoder(
  constant<'registeredKeyFired'>('registeredKeyFired'),
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

export { decoder };
