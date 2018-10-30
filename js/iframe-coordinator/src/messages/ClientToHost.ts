import { LabeledPublication } from './Publication';
import { LabeledToast } from './Toast';
import { LabeledNavRequest } from './NavRequest';

export type ClientToHost =
  | LabeledPublication
  | LabeledToast
  | LabeledNavRequest;

export function validate(msg: ClientToHost) {
  //TODO: actually validate cases
  switch (msg.msgType) {
    case 'navRequest':
      return msg;
    case 'toastRequest':
      return msg;
    case 'publish':
      return msg;
  }
}
