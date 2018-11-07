import { Guard } from 'decoders';

/**
 * Creates a generic validator for messages sent between the host and the client.
 * @param messageType The type identifier that must match against the message.
 * @param decoder The decoder used to decode and validate the message data.
 */
export function createMessageValidator<T>(
  messageType: string,
  decoder: Guard<any>
): (msg: any) => T | null {
  return (msg: any) => {
    if (msg.msgType !== messageType) {
      return null;
    }

    try {
      msg.msg = decoder(msg.msg);
      return msg;
    } catch {
      return null;
    }
  };
}
