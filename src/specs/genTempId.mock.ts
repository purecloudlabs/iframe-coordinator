let tempId = '1';

/**
 * Set the temporary id for the mock generation
 */
export function setTempId(value: string) {
  tempId = value;
}

/**
 * Mocks the temporary id generation to pre-defined values.
 */
export function genTempId() {
  return tempId;
}
