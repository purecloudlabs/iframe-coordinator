import { guard, mixed, object, string } from 'decoders';
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
  topic: string;
  payload: any;
}

/**
 * Handles publications
 */
export type PublicationHandler = (publication: Publication) => void;

/**
 * A message used to publish a generic messages
 * to the host application.
 */
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
