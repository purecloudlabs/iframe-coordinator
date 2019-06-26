/**
 * Encodes filtered topics so it can be passed in a post message
 * @param filters The original filters Map
 */
export function encodeFilters(
  filters: Map<string, (event: any) => boolean>
): Map<string, string> {
  const retVal = new Map();
  filters.forEach((filter, topic) => {
    retVal.set(topic, filter.toString());
  });
  return retVal;
}

/**
 * Decodes filtered topics from a post message.
 * @param filters The encoded filters Map
 */
export function decodeFilters(
  filters: Map<string, string>
): Map<string, (event: any) => boolean> {
  const retVal = new Map();
  filters.forEach((filter, topic) => {
    // tslint:disable-next-line: no-eval
    retVal.set(topic, eval(filter));
  });
  return retVal;
}
