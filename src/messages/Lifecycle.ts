import { guard, mixed, object, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

/**
 * A lifecylcle message for coordination between host and client.
 *
 * @remarks
 * These are for internal use only.
 */
export interface Lifecycle {
  stage: string;
  data?: any;
}

/**
 * A message used to coordinate the lifecycle
 * of host and client elements.
 */
export interface LabeledLifecycle extends LabeledMsg {
  msgType: 'lifecycle';
  msg: Lifecycle;
}

const lifecycleDecoder = guard(
  object({
    stage: string,
    data: mixed
  })
);

const validateLifecycle = createMessageValidator<LabeledLifecycle>(
  'lifecycle',
  lifecycleDecoder
);
export { validateLifecycle };
