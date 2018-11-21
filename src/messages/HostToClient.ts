import {
  LabeledEnvInit,
  LabeledSetClientId,
  validateEnvData,
  validateSetClientId
} from './Lifecycle';
import { LabeledPublication, validateHostPublication } from './Publication';

/**
 * All avaiable message types that can be sent
 * from the host application to the client content.
 */
export type HostToClient =
  | LabeledPublication
  | LabeledEnvInit
  | LabeledSetClientId;

/**
 * Validates correctness of messages being sent from
 * the host to the client.
 * @param msg The message requiring validation.
 */
export function validate(msg: any): HostToClient | null {
  if (!msg || !msg.msgType) {
    return null;
  }

  return (
    validateHostPublication(msg) ||
    validateEnvData(msg) ||
    validateSetClientId(msg)
  );
}
