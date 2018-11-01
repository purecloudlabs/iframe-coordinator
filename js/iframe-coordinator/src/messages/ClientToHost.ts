import { LabeledNavRequest } from './NavRequest';
import { LabeledPublication } from './Publication';
import { LabeledToast } from './Toast';

export type ClientToHost =
  | LabeledPublication
  | LabeledToast
  | LabeledNavRequest;

/**
 * Validates correctness of messages being sent from
 * the client to the host.
 * @param msg The message requiring validation.
 */
export function validate(msg: ClientToHost): ClientToHost {
  // TODO: actually validate cases
  switch (msg.msgType) {
    case 'navRequest':
      return msg;
    case 'toastRequest':
      return msg;
    case 'publish':
      return msg;
  }
}
