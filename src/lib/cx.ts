/**
 * Joins class names.
 *
 * The empty ones are dropped rather than turned into a space, so a component
 * can pass a conditional class without guarding the call: the class is either
 * there or it is not.
 */
export function cx(
  ...names: Array<string | false | null | undefined>
): string {
  return names.filter((name): name is string => Boolean(name)).join(" ")
}
