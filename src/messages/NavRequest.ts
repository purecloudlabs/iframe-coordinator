import { constant, Decoder, object, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';

/**
 * The navigation request data.
 */
export interface NavRequest {
  /** The URL the client wants to navigate to */
  url: string;
}

/**
 * A message used to request the host navigate to another
 * URI.
 * @external
 */
export interface LabeledNavRequest extends LabeledMsg {
  /** Message identifier */
  msgType: 'navRequest';
  /** Navigation request details */
  msg: NavRequest;
}

/** @external */
const decoder: Decoder<LabeledNavRequest> = object({
  msgType: constant<'navRequest'>('navRequest'),
  msg: object({
    url: string
  })
});

export { decoder };
