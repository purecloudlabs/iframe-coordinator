import { guard, mixed, object, optional, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

export interface Toast {
  title?: string;
  message: string;
  custom: any;
}

export interface LabeledToast extends LabeledMsg {
  msgType: 'toastRequest';
  msg: Toast;
}

const toastDecoder = guard(
  object({
    title: optional(string),
    message: string,
    custom: mixed
  })
);

const validateToast = createMessageValidator<LabeledToast>(
  'toastRequest',
  toastDecoder
);
export { validateToast };
