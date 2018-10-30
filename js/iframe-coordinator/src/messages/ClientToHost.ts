import { LabeledNavRequest } from './NavRequest';
import { LabeledPublication } from './Publication';
import { LabeledToast } from './Toast';

export type ClientToHost =
  | LabeledPublication
  | LabeledToast
  | LabeledNavRequest;

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
