import { constant, guard, mixed, object, string } from 'decoders';
import { LabeledPublication } from './Publication';

export type HostToClient = LabeledPublication;

const labeledPublicationDecoder = guard(
  object({
    msgType: constant('publish'),
    msg: object({
      topic: string,
      payload: mixed
    })
  })
);

export function validate(msg: any): HostToClient | null {
  try {
    return labeledPublicationDecoder(msg);
  } catch {
    return null;
  }
}
