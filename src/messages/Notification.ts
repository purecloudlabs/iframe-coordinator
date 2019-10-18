import {
  constant,
  Decoder,
  either,
  map,
  mixed,
  object,
  optional,
  string
} from 'decoders';
import { LabeledMsg } from './LabeledMsg';

/**
 * A toast configuration.
 */
export interface Notification {
  /** The title of the notification */
  title?: string;
  /** The notification message */
  message: string;
  /** Additional host-specific options such as severity */
  custom: any;
}

/**
 * A message used to request notifications to display
 * in the host application.
 * @external
 */
export interface LabeledNotification extends LabeledMsg {
  /** Message identifier */
  msgType: 'notifyRequest';
  /** Toast details */
  msg: Notification;
}

/**
 * Helper function to convert old message types to the new type
 * @external
 */
function alwaysMsgType(msgType: 'string'): 'notifyRequest' {
  return 'notifyRequest';
}

/** @external */
const toastTypeDecoder: Decoder<'notifyRequest'> = map(
  constant<'toastRequest'>('toastRequest'),
  alwaysMsgType
);

/** @external */
const decoder: Decoder<LabeledNotification> = object({
  msgType: either(constant<'notifyRequest'>('notifyRequest'), toastTypeDecoder),
  msg: object({
    title: optional(string),
    message: string,
    custom: mixed
  })
});

export { decoder };
