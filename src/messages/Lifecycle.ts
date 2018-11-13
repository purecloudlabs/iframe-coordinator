import { guard, mixed, object, string } from 'decoders';
import { LabeledMsg } from './LabeledMsg';
import { createMessageValidator } from './validationUtils';

/**
 * Lifecycle stage in which the client
 * notifies the host that they have started
 * and ready to recieve messages.
 */
export interface LifecycleStarted {
  stage: 'started';
}

/**
 * Lifecycle stage in which the client
 * notifies the host that they have stopped.
 */
export interface LifecycleStopped {
  stage: 'stopped';
}

/**
 * Environmental data provided to all clients
 * in order to match behavior of the host application.
 */
export interface EnvData {
  locale: string;
}

/**
 * Lifecycle stage where environmental data
 * is sent to the client.
 */
export interface LifecycleEnvironmentInit {
  stage: 'env_init';
  data: EnvData;
}

/**
 * A lifecycle message for coordination between host and client.
 *
 * @remarks
 * These are for internal use only.
 */
export type LifecycleStage =
  | LifecycleStarted
  | LifecycleStopped
  | LifecycleEnvironmentInit;

/**
 * Generator for a {@link LabeledLifecycle} message which
 * packages an {@link LifecycleEnvironmentInit} stage.
 */
type LabeledLifecycleEnvInitGenerator = (envData: EnvData) => LabeledLifecycle;

/**
 * Helpfull properties for working with lifecycle stages and
 * their coresponding labeled messages.
 */
export class Lifecycle {
  /**
   * A {@link LifecycleStarted} message to send to the host application.
   */
  public static startedMessage: LabeledLifecycle = {
    msgType: 'lifecycle',
    msg: { stage: 'started' }
  };

  /**
   * A {@link LifecycleStopped} message to send to the host application.
   */
  public static stoppedMessage: LabeledLifecycle = {
    msgType: 'lifecycle',
    msg: { stage: 'stopped' }
  };

  /**
   * Gnerates a {@link LabeledLifecycle} for sending an
   * {@link LifecycleEnvironmentInit} stage between host and client.
   */
  public static genEnvInitMessage: LabeledLifecycleEnvInitGenerator = (
    envData: EnvData
  ) => {
    return {
      msgType: 'lifecycle',
      msg: {
        stage: 'env_init',
        data: envData
      }
    };
  };

  /**
   * Determines whether the stage is an {@link LifecycleStarted}.
   *
   * @param stage The lifecycle stage to test.
   */
  public static isStartedStage(stage: LifecycleStage): boolean {
    return stage.stage === 'started';
  }

  /**
   * Determines whether the stage is an {@link LifecycleStopped}.
   *
   * @param stage The lifecycle stage to test.
   */
  public static isStoppedStage(stage: LifecycleStage): boolean {
    return stage.stage === 'stopped';
  }

  /**
   * Determines whether the stage is an {@link LifecycleEnvironmentInit}.
   *
   * @param stage The lifecycle stage to test.
   */
  public static isEnvInitStage(stage: LifecycleStage): boolean {
    return stage.stage === 'env_init';
  }
}

/**
 * A message used to coordinate the lifecycle
 * of host and client elements.
 */
export interface LabeledLifecycle extends LabeledMsg {
  msgType: 'lifecycle';
  msg: LifecycleStage;
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
