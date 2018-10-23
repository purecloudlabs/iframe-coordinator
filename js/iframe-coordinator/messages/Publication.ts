import { LabeledMsg } from './LabeledMsg';

export interface Publication {
  topic: String;
  payload: any;
}

export interface LabeledPublication extends LabeledMsg {
  msgType: 'publish';
  msg: Publication;
}
