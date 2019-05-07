import { guard, mixed, object, optional, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

/**
 * A publication configuration.
 *
 * @remarks
 * The host must subscribe to the topic
 * in order to recieve this message.
 */
export interface Publication {
  /** Topic to publish on */
  topic: string;
  /** Data to publish */
  payload: any;
  /** Client the message originates from */
  clientId?: string;
}

/**
 * A message used to publish a generic messages
 * between the clients and the host application.
 * @external
 */
export interface LabeledPublication extends LabeledMsg {
  /** Message identifier */
  msgType: 'publish';
  /** Details of the data to publish */
  msg: Publication;
}

/** @external */
const publicationDecoder = guard(
  object({
    topic: string,
    payload: mixed,
    clientId: optional(string)
  })
);

/** @external */
const validatePublication = createMessageValidator<LabeledPublication>(
  'publish',
  publicationDecoder
);

export { validatePublication };
