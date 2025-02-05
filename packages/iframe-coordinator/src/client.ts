/**
 * [[include:client-setup.md]]
 * @module
 */
import { EventEmitter, EventHandler } from "./EventEmitter";
import { WorkerClient } from "./WorkerClient";
import { ClientConfigOptions, IframeClient } from "./IframeClient";
import {
  Breadcrumb,
  ModalRequest,
  NavRequest,
  Notification,
  PageMetadata,
  PromptOnLeave,
  Publication,
} from "./messages";
import { EnvData, KeyData } from "./host";
import { EnvDataHandler } from "./AbstractClient";

export {
  IframeClient as Client,
  WorkerClient,
  type ClientConfigOptions,
  type EnvDataHandler,
};

// Lecacy compatibility exports - superceded by messaging.ts
export {
  type EventEmitter,
  type EnvData,
  type Publication,
  type ModalRequest,
  type NavRequest,
  type Notification,
  type PromptOnLeave,
  type KeyData,
  type PageMetadata,
  type Breadcrumb,
  type EventHandler,
};
