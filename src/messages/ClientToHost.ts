import { LabeledLifecycle, validateLifecycle } from './Lifecycle';
import { LabeledNavRequest, validateNavRequest } from './NavRequest';
import { LabeledPublication, validatePublication } from './Publication';
import { LabeledToast, validateToast } from './Toast';

/**
 * All avaiable message types that can be sent
 * from the client content to the host application.
 */
export type ClientToHost =
  | LabeledPublication
  | LabeledToast
  | LabeledNavRequest
  | LabeledLifecycle;

/**
 * Validates correctness of messages being sent from
 * the client to the host.
 * @param msg The message requiring validation.
 */
export function validate(msg: any): ClientToHost | null {
  if (!msg || !msg.msgType || !msg.msg) {
    return null;
  }

  return (
    validateNavRequest(msg) ||
    validatePublication(msg) ||
    validateToast(msg) ||
    validateLifecycle(msg)
  );
}
