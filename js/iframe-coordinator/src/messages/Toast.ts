import { LabeledMsg } from './LabeledMsg';

/**
 * A toast configuration.
 */
export interface Toast {
  title: string | null;
  message: string;
  custom: any;
}

/**
 * A message used to request toasts to display
 * in the host application.
 */
export interface LabeledToast extends LabeledMsg {
  msgType: 'toastRequest';
  msg: Toast;
}
