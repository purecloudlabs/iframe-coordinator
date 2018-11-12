import { LabeledLifecycle, validateLifecycle } from './Lifecycle';
import { LabeledPublication, validatePublication } from './Publication';

export type HostToClient = LabeledPublication | LabeledLifecycle;

export function validate(msg: any): HostToClient | null {
  if (!msg || !msg.msgType || !msg.msg) {
    return null;
  }

  return validatePublication(msg) || validateLifecycle(msg);
}
