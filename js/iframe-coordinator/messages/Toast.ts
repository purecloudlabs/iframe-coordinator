import { LabeledMsg } from './LabeledMsg';

export interface Toast {
  title: String | null;
  message: String;
  custom: any;
}

export interface LabeledToast extends LabeledMsg {
  msgType: 'toastRequest';
  msg: Toast;
}
