import { constant, Decoder, mixed, object, optional, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';

/**
 * A toast configuration.
 */
export interface Toast {
  /** The title of the notification */
  title?: string;
  /** The notification message */
  message: string;
  /** Additional host-specific options such as severity */
  custom: any;
}

/**
 * A message used to request toasts to display
 * in the host application.
 * @external
 */
export interface LabeledToast extends LabeledMsg {
  /** Message identifier */
  msgType: 'toastRequest';
  /** Toast details */
  msg: Toast;
}

/** @external */
const decoder: Decoder<LabeledToast> = object({
  msgType: constant<'toastRequest'>('toastRequest'),
  msg: object({
    title: optional(string),
    message: string,
    custom: mixed
  })
});

export { decoder };
