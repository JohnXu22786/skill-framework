/**
 * Frontmatter splitting for SKILL.md documents.
 *
 * A skill document starts with a YAML block delimited by `---` lines. This
 * module finds that block, parses it with the `yaml` package, and returns the
 * parsed data together with the remaining markdown body.
 */

import { parse } from 'yaml';

/** A document whose leading YAML frontmatter was recognized and parsed. */
export interface ParsedDocument {
  /** Parsed frontmatter object. */
  readonly data: Readonly<Record<string, unknown>>;
  /** Markdown body following the closing `---` marker. */
  readonly body: string;
}

/**
 * Split `---`-delimited YAML frontmatter off the head of a markdown document.
 *
 * @param raw - full document text.
 * @returns the parsed frontmatter and body, or `undefined` when the document
 *   does not start with a frontmatter marker.
 * @throws {SyntaxError} when the frontmatter block exists but is not valid YAML.
 */
export function splitFrontmatter(raw: string): ParsedDocument | undefined {
  const firstBreak = raw.indexOf('\n');
  if (firstBreak < 0) return undefined;
  if (raw.slice(0, firstBreak).replace(/\r$/, '') !== '---') return undefined;

  const start = firstBreak + 1;
  const closing = findClosingMarker(raw, start);
  if (closing === undefined) return undefined;

  const parsed = parse(raw.slice(start, closing.lineStart));
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return undefined;
  return {
    data: parsed as Record<string, unknown>,
    body: raw.slice(closing.bodyStart),
  };
}

interface ClosingMarker {
  /** Character offset of the line that begins with the closing `---`. */
  readonly lineStart: number;
  /** Character offset where the markdown body starts (after the marker line). */
  readonly bodyStart: number;
}

function findClosingMarker(raw: string, start: number): ClosingMarker | undefined {
  let lineStart = start;
  while (lineStart <= raw.length) {
    const nextBreak = raw.indexOf('\n', lineStart);
    const lineEnd = nextBreak < 0 ? raw.length : nextBreak;
    if (raw.slice(lineStart, lineEnd).replace(/\r$/, '') === '---') {
      return {
        lineStart,
        bodyStart: nextBreak < 0 ? raw.length : nextBreak + 1,
      };
    }
    if (nextBreak < 0) return undefined;
    lineStart = nextBreak + 1;
  }
  return undefined;
}
