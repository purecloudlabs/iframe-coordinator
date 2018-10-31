import { LabeledMsg } from './LabeledMsg';

export interface Publication {
  topic: string;
  payload: any;
}

export interface LabeledPublication extends LabeledMsg {
  msgType: string;
  msg: Publication;
}
