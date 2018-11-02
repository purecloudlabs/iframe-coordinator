import { LabeledNavRequest, validateNavRequest } from './NavRequest';
import { LabeledPublication, validatePublication } from './Publication';
import { LabeledToast, validateToast } from './Toast';

export type ClientToHost =
  | LabeledPublication
  | LabeledToast
  | LabeledNavRequest;

export function validate(msg: any): ClientToHost | null {
  if (!msg || !msg.msgType || !msg.msg) {
    return null;
  }

  return (
    validateNavRequest(msg) || validatePublication(msg) || validateToast(msg)
  );
}
