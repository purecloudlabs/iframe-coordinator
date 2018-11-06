import { LabeledEnvData, validateEnvData } from './EnvData';
import { LabeledPublication, validatePublication } from './Publication';

/**
 * All avaiable message types that can be sent
 * from the host application to the client content.
 */
export type HostToClient = LabeledPublication | LabeledEnvData;

/**
 * Validates correctness of messages being sent from
 * the host to the client.
 * @param msg The message requiring validation.
 */
export function validate(msg: any): HostToClient | null {
  if (!msg || !msg.msgType || !msg.msg) {
    return null;
  }

  return validatePublication(msg) || validateEnvData(msg);
}
