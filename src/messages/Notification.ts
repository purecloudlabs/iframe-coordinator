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
import { labeledDecoder, LabeledMsg } from './LabeledMsg';

/**
 * A notification configuration for an interface such as a toast-style
 * message displayed by the host application.
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
 */
export interface LabeledNotification
  extends LabeledMsg<'notifyRequest', Notification> {
  /** Message identifier */
  msgType: 'notifyRequest';
  /** Toast details */
  msg: Notification;
}

/**
 * Helper function to convert old message types to the new type
 */
function alwaysMsgType(msgType: 'string'): 'notifyRequest' {
  return 'notifyRequest';
}

const toastTypeDecoder: Decoder<'notifyRequest'> = map(
  constant<'toastRequest'>('toastRequest'),
  alwaysMsgType
);

const decoder: Decoder<LabeledNotification> = labeledDecoder(
  either(constant<'notifyRequest'>('notifyRequest'), toastTypeDecoder),
  object({
    title: optional(string),
    message: string,
    custom: mixed
  })
);

export { decoder };
