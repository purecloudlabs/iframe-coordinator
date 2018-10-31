import {
  constant,
  either3,
  guard,
  mixed,
  object,
  optional,
  string
} from 'decoders';
import { LabeledNavRequest } from './NavRequest';
import { LabeledPublication } from './Publication';
import { LabeledToast } from './Toast';

export type ClientToHost =
  | LabeledPublication
  | LabeledToast
  | LabeledNavRequest;

const labeledPublicationDecoder = object({
  msgType: constant('publish'),
  msg: object({
    topic: string,
    payload: mixed
  })
});

const labeledToastDecoder = object({
  msgType: constant('toastRequest'),
  msg: object({
    title: optional(string),
    message: string,
    custom: mixed
  })
});

const labeledNavRequestDecoder = object({
  msgType: constant('navRequest'),
  msg: object({
    url: string
  })
});

const decoder = guard(
  either3(
    labeledPublicationDecoder,
    labeledToastDecoder,
    labeledNavRequestDecoder
  )
);

export function validate(msg: any): ClientToHost | null {
  try {
    return decoder(msg);
  } catch {
    return null;
  }
}
