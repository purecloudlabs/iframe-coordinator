import {
  array,
  constant,
  Decoder,
  mixed,
  object,
  optional,
  string
} from 'decoders';
import { labeledDecoder, LabeledMsg } from './LabeledMsg';

/**
 * The Page metadata
 */
export interface PageMetadata {
  /** Title of the Page for the browser */
  title: string;
  /** Breadcrumbs that lead to page */
  breadcrumbs: Breadcrumb[];
  /** holder for any custom data client wants to send for page */
  custom?: any;
}

/**
 * Single breadcrumb
 */
export interface Breadcrumb {
  /** UI text for breadcrumb */
  text: string;
  /** link href for routing to breadcrumb's page */
  href: string;
}

/**
 * A message used to send metadata of a page
 * from the clients to the host application.
 */
export interface LabeledPageMetadata
  extends LabeledMsg<'pageMetadata', PageMetadata> {
  /** Message identifier */
  msgType: 'pageMetadata';
  /** Modal request details (type and data) */
  msg: PageMetadata;
}

const decoder: Decoder<LabeledPageMetadata> = labeledDecoder(
  constant<'pageMetadata'>('pageMetadata'),
  object({
    title: string,
    breadcrumbs: array(
      object({
        text: string,
        href: string
      })
    ),
    custom: optional(mixed)
  })
);

export { decoder };
