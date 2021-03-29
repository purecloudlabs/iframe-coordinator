import {
  constant,
  Decoder,
  map,
  mixed,
  object,
  optional,
  string
} from 'decoders';
import { labeledDecoder, LabeledMsg } from './LabeledMsg';

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
  /**
   * Client the message originates from. This should not be provided when
   * calling client methods. The value will be ignored and the library
   * will fill it in.
   */
  clientId?: string;
}

/**
 * A message used to publish a generic messages
 * between the clients and the host application.
 */
export interface LabeledPublication extends LabeledMsg<'publish', Publication> {
  /** Message identifier */
  msgType: 'publish';
  /** Details of the data to publish */
  msg: Publication;
}

const decoder: Decoder<LabeledPublication> = labeledDecoder(
  constant<'publish'>('publish'),
  object({
    topic: string,
    payload: mixed,
    clientId: optional(string)
  })
);

export { decoder };
