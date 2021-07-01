import { constant, Decoder, mixed } from 'decoders';
import { labeledDecoder, LabeledMsg } from './LabeledMsg';

/**
 * A message used to publish a generic messages
 * between the clients and the host application.
 */
export interface LabeledModal extends LabeledMsg<'modalRequest', any> {
  /** Message identifier */
  msgType: 'modalRequest';
}

const decoder: Decoder<LabeledModal> = labeledDecoder(
  constant<'modalRequest'>('modalRequest'),
  mixed
);

export { decoder };
