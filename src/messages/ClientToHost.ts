import { LabeledStarted, validateStarted } from './Lifecycle';
import { LabeledNavRequest, validateNavRequest } from './NavRequest';
import {
  LabeledClientPublication,
  validateClientPublication
} from './Publication';
import { LabeledToast, validateToast } from './Toast';

/**
 * All avaiable message types that can be sent
 * from the client content to the host application.
 */
export type ClientToHost =
  | LabeledClientPublication
  | LabeledToast
  | LabeledNavRequest
  | LabeledStarted;

/**
 * Validates correctness of messages being sent from
 * the client to the host.
 * @param msg The message requiring validation.
 */
export function validate(msg: any): ClientToHost | null {
  if (!msg || !msg.msgType) {
    return null;
  }

  return (
    validateNavRequest(msg) ||
    validateClientPublication(msg) ||
    validateToast(msg) ||
    validateStarted(msg)
  );
}
