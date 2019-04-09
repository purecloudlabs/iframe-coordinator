import { guard, mixed, object, optional, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

/**
 * A toast configuration.
 */
export interface Toast {
  title?: string;
  message: string;
  custom: any;
}

/**
 * A message used to request toasts to display
 * in the host application.
 * @external
 */
export interface LabeledToast extends LabeledMsg {
  msgType: 'toastRequest';
  msg: Toast;
}

/** @external */
const toastDecoder = guard(
  object({
    title: optional(string),
    message: string,
    custom: mixed
  })
);

/** @external */
const validateToast = createMessageValidator<LabeledToast>(
  'toastRequest',
  toastDecoder
);
export { validateToast };
