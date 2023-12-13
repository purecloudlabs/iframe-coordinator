import { Publication } from "./messages/Publication";

/**
 * Callback which can handle a publication message.
 */
export type PublicationHandler = (publication: Publication) => void;

/**
 * Manages topic subscriptions and
 * publish events for {@link Publication | Publications}.
 */
export class SubscriptionManager {
  private _handler: PublicationHandler | null;
  private _interestedTopics: Set<string>;

  constructor() {
    this._handler = null;
    this._interestedTopics = new Set();
  }

  /**
   * Adds a new topic to the publications
   * that will be dispatched.
   *
   * @param topic The new topic to dispatch messages for.
   */
  public subscribe(topic: string): void {
    this._interestedTopics.add(topic);
  }

  /**
   * Removes a topic to be dispatched when attempting
   * to publish.
   *
   * @param topic The topic to no longer dispatch messages for.
   */
  public unsubscribe(topic: string): void {
    this._interestedTopics.delete(topic);
  }

  /**
   * Set the handler to be called when dispatching
   * a new publication.  Only one handler can be set.
   *
   * @param handler The callback for dispatched messages.
   */
  public setHandler(handler: PublicationHandler) {
    this._handler = handler;
  }

  /**
   * Dispatches a new publication to the handler if their topic
   * has been subscribed to.
   *
   * @param publication The publication message to dispatch.
   */
  public dispatchMessage(publication: Publication) {
    if (
      this._interestedTopics.has(publication.topic) &&
      this._handler != null
    ) {
      this._handler(publication);
    }
  }
}
