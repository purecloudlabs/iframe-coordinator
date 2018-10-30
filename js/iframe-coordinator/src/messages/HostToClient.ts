import { LabeledPublication } from './Publication';

export type HostToClient = LabeledPublication;

export function validate(msg: HostToClient): HostToClient {
  // TODO: actually validate cases
  switch (msg.msgType) {
    case 'publish':
      return msg;
  }
}
