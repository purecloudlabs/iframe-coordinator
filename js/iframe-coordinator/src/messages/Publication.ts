import { LabeledMsg } from './LabeledMsg';

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
 * A message used to publish a generic messages
 * to the host application.
 */
export interface LabeledPublication extends LabeledMsg {
  msgType: 'publish';
  msg: Publication;
}
