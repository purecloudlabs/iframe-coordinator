import { LabeledEnvData, validateEnvData } from './EnvData';
import { LabeledPublication, validatePublication } from './Publication';

export type HostToClient = LabeledPublication | LabeledEnvData;

export function validate(msg: any): HostToClient | null {
  if (!msg || !msg.msgType || !msg.msg) {
    return null;
  }

  return validatePublication(msg) || validateEnvData(msg);
}
