import { Facilitator } from './types';

type FacilitatorKey<F extends Facilitator> = `${F['id']}:${F['chain']}`;

type HasDuplicate<
  T extends readonly Facilitator[],
  Seen extends string = never,
> = T extends readonly [
  infer First extends Facilitator,
  ...infer Rest extends readonly Facilitator[],
]
  ? FacilitatorKey<First> extends Seen
    ? FacilitatorKey<First>
    : HasDuplicate<Rest, Seen | FacilitatorKey<First>>
  : never;

export function validateUniqueFacilitators<
  const T extends readonly Facilitator[],
>(
  facilitators: HasDuplicate<T> extends never
    ? T
    : `❌ COMPILE ERROR: Duplicate facilitator '${HasDuplicate<T>}' - each id+chain must be unique!`
): T {
  return facilitators;
}
