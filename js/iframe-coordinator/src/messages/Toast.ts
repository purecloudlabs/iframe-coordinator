import { LabeledMsg } from './LabeledMsg';

export interface Toast {
  title: string | null;
  message: string;
  custom: any;
}

export interface LabeledToast extends LabeledMsg {
  msgType: 'toastRequest';
  msg: Toast;
}
