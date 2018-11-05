import { Guard } from 'decoders';

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
