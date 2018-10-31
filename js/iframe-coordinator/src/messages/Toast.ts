import { LabeledMsg } from './LabeledMsg';

export interface Toast {
  title?: string;
  message: string;
  custom: any;
}

export interface LabeledToast extends LabeledMsg {
  msgType: string;
  msg: Toast;
}
