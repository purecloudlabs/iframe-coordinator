import { Publication } from './messages/Publication';

export type PublicationHandler = (publication: Publication) => void;

export class SubscriptionManager {
  private _handler: PublicationHandler | null;
  private _interestedTopics: Set<string>;

  constructor() {
    this._handler = null;
    this._interestedTopics = new Set();
  }

  public subscribe(topic: string): void {
    this._interestedTopics.add(topic);
  }

  public unsubscribe(topic: string): void {
    this._interestedTopics.delete(topic);
  }

  public setHandler(handler: PublicationHandler) {
    this._handler = handler;
  }

  public dispatchMessage(publication: Publication) {
    if (
      this._interestedTopics.has(publication.topic) &&
      this._handler != null
    ) {
      this._handler(publication);
    }
  }
}
