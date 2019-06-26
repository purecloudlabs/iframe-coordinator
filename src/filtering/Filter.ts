/**
 * The type of comparision
 */
export enum ComparisonType {
  /** Value must match exactly */
  exact,
  /** Value must contain value */
  contains,
  /** Value must start with value */
  prefix,
  /** Value must end with value */
  postfix
}

/**
 * How the filters should be junctioned.
 */
export enum Junction {
  /** All statements must be true */
  and,
  /** One statements must be true */
  or
}

/**
 * A actual filter
 */
export interface DataFilter {
  /** The property to test */
  property: string;
  /** How the property will be tested */
  comparison: ComparisonType;
  /** What the property will be tested against */
  expected: string;
}

/**
 * The root level filter.
 */
export interface Filter {
  /** The filters to apply */
  filters: DataFilter[];
  /** How the filters will be tested */
  junction: Junction;
}

/**
 * tests to see if a data object is in a filter
 * @param filter The filter to test with
 * @param data The data to test against
 */
function testFilter(filter: DataFilter, data: any): boolean {
  let propertyData = data[filter.property];

  if (!(propertyData instanceof String)) {
    propertyData = JSON.stringify(propertyData);
  }

  switch (filter.comparison) {
    case ComparisonType.exact:
      return propertyData === filter.expected;
    case ComparisonType.contains:
      return new RegExp(`.*${filter.expected}.*`).test(propertyData);
    case ComparisonType.prefix:
      return propertyData.startsWith(filter.expected);
    case ComparisonType.postfix:
      return propertyData.endsWith(filter.expected);
    default:
      return false;
  }
}

/**
 * tests to see if a data object is in a filter
 * @param filter The filter to test with
 * @param data The data to test against
 */
export function inFilter(filter: Filter, data: any): boolean {
  if (filter.junction === Junction.and) {
    return filter.filters.every(f => testFilter(f, data));
  }

  return filter.filters.some(f => testFilter(f, data));
}
