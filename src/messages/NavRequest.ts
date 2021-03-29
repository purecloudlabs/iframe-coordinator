import { constant, Decoder, object, string } from 'decoders';
import { labeledDecoder, LabeledMsg } from './LabeledMsg';

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
 */
export interface LabeledNavRequest
  extends LabeledMsg<'navRequest', NavRequest> {
  /** Message identifier */
  msgType: 'navRequest';
  /** Navigation request details */
  msg: NavRequest;
}

const decoder: Decoder<LabeledNavRequest> = labeledDecoder(
  constant<'navRequest'>('navRequest'),
  object({
    url: string
  })
);

export { decoder };
