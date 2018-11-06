import { guard, mixed, object, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

export interface EnvData {
  locale: string;
}

const envDataDecoder = guard(
  object({
    locale: string
  })
);

export interface LabeledEnvData extends LabeledMsg {
  msgType: 'envData';
  msg: EnvData;
}

const validateEnvData = createMessageValidator<LabeledEnvData>(
  'envData',
  envDataDecoder
);
export { validateEnvData };
