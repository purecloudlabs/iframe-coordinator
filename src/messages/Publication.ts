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
 * A strictly-typed event handler for publication messages.
 */
export declare interface PublicationEventEmitter {
  emit(topic: string, publication: Publication): boolean;
  addListener(topic: string, listener: PublicationHandler): this;
  on(type: string, listener: PublicationHandler): this;
  once(type: string, listener: PublicationHandler): this;
  removeListener(type: string, listener: PublicationHandler): this;
  removeAllListeners(type?: string): this;
  listenerCount(type: string): number;
}

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
