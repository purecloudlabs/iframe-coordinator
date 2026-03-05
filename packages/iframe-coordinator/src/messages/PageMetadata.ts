import {
  array,
  constant,
  Decoder,
  exact,
  optional,
  string,
  unknown,
} from "decoders";
import { labeledDecoder, LabeledMsg } from "./LabeledMsg";

/**
 * The Page metadata
 */
export interface PageMetadata {
  /** Title of the Page for the browser */
  title: string;
  /** Breadcrumbs that lead to page */
  breadcrumbs: Breadcrumb[];
  /** Holder for any custom data client wants to send for page */
  custom?: any;
}

/**
 * Single breadcrumb
 */
export interface Breadcrumb {
  /** UI text for breadcrumb */
  text: string;
  /** Link href for routing to breadcrumb's page */
  href: string;
}

/**
 * A message used to send metadata of a page
 * from the clients to the host application.
 */
export interface LabeledPageMetadata extends LabeledMsg<
  "pageMetadata",
  PageMetadata
> {
  /** Message identifier */
  msgType: "pageMetadata";
  /** Modal request details (type and data) */
  msg: PageMetadata;
}

const decoder: Decoder<LabeledPageMetadata> = labeledDecoder(
  constant<"pageMetadata">("pageMetadata"),
  exact({
    title: string,
    breadcrumbs: array(
      exact({
        text: string,
        href: string,
      }),
    ),
    custom: optional(unknown),
  }),
);

export { decoder };
