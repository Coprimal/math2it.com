/**
 * Local re-declarations of the two dynamic-route props interfaces from notion-x.
 *
 * Task 0.4 (Phase 0): These replace the same-named types in notion-x/src/interface.ts
 * so that `params` is typed as `Promise<...>`, matching Next 15/16's async dynamic API.
 * notion-x is a git submodule — edits there would not persist in math2it commits.
 *
 * The inner shapes match the originals in notion-x/src/interface.ts:
 *   - DynamicSegmentParamsProps: params was { slug: string }
 *   - OptionalCatchAllProps:     params was { slug: string[] } (optional here because
 *     [[...slug]] routes receive undefined slug at the root path)
 */

export interface DynamicSegmentParamsProps {
  params: Promise<{ slug: string }>
}

export interface OptionalCatchAllProps {
  params: Promise<{ slug?: string[] }>
}
