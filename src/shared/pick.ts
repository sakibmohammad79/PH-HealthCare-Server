//obj => all query;  key: field name
const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const finalQuery: Partial<T> = {};
  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalQuery[key] = obj[key];
    }
  }
  return finalQuery;
};
export default pick;
