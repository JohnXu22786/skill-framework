/**
 * Filesystem scanning of a skill library directory.
 *
 * One library root contains skill entries in either of the two standard
 * layouts: a directory bundle (`<name>/SKILL.md`) or a flat markdown file
 * (`<name>.md`). This module walks one root, parses every entry it finds, and
 * reports malformed entries as warnings instead of failing the whole scan.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import { parseSkillDocument, SkillDocumentError, type SkillDocument } from './document.js';

/** One discovered skill entry inside a library root. */
export interface CatalogEntry {
  /** Parsed and validated skill document. */
  readonly document: SkillDocument;
  /** Directory that serves as the resource base for relative references. */
  readonly directory: string;
  /** Absolute path of the SKILL.md (or flat `.md`) file. */
  readonly path: string;
}

/** Result of scanning one library root. */
export interface CatalogResult {
  /** Discovered entries, sorted by skill name. */
  readonly entries: readonly CatalogEntry[];
  /** Human-readable warnings for entries that were skipped. */
  readonly warnings: readonly string[];
}

/**
 * Scan one library root for skill entries.
 *
 * @param root - absolute path of the library directory.
 * @param options - optional abort signal.
 * @returns discovered entries and warnings. An absent root is an empty library;
 *   malformed entries are reported as warnings, never as scan failures.
 */
export async function scanLibrary(
  root: string,
  options: { readonly signal?: AbortSignal } = {},
): Promise<CatalogResult> {
  options.signal?.throwIfAborted();
  let entries: readonly Dirent[];
  try {
    entries = (await readdir(root, { withFileTypes: true, encoding: 'utf8' })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  } catch (error) {
    if (isAbsentPathError(error)) return { entries: [], warnings: [] };
    throw error;
  }

  const catalog: CatalogEntry[] = [];
  const warnings: string[] = [];
  for (const entry of entries) {
    const kind = await entryKind(root, entry);
    const locator = locatorForEntry(root, entry.name, kind);
    if (locator === undefined) continue;
    let raw: string;
    try {
      raw = await readFile(locator.path, { encoding: 'utf8', signal: options.signal });
    } catch (error) {
      // Not a readable skill file: absent SKILL.md, or a path that resolved
      // to a directory. Neither is a scan failure.
      if (isNotReadableSkillFileError(error)) continue;
      throw error;
    }
    options.signal?.throwIfAborted();
    try {
      const document = parseSkillDocument(raw);
      if (document.name !== locator.expectedName) {
        warnings.push(`skill file ${locator.path}: frontmatter name "${document.name}" does not match ${locator.expectedName}; skipped`);
        continue;
      }
      catalog.push({
        document,
        directory: locator.directory,
        path: locator.path,
      });
    } catch (error) {
      if (error instanceof SkillDocumentError) {
        warnings.push(`skill file ${locator.path} ignored: ${error.message}`);
        continue;
      }
      throw error;
    }
  }
  return { entries: catalog, warnings };
}

interface EntryLocator {
  readonly path: string;
  readonly directory: string;
  readonly expectedName: string;
}

/**
 * Resolve the effective entry kind, following symbolic links so a junction or
 * symlink pointing at a skill directory is discovered like a real directory.
 *
 * @returns `'directory'`, `'file'`, or `undefined` when the entry is neither
 *   (or the link target is absent).
 */
async function entryKind(root: string, entry: Dirent): Promise<'directory' | 'file' | undefined> {
  if (entry.isDirectory()) return 'directory';
  if (entry.isFile()) return 'file';
  if (entry.isSymbolicLink()) {
    try {
      const info = await stat(join(root, entry.name));
      if (info.isDirectory()) return 'directory';
      if (info.isFile()) return 'file';
    } catch (error) {
      // Absent or looping links are neither files nor directories.
      if (isAbsentPathError(error) || hasErrorCode(error, 'ELOOP')) return undefined;
      throw error;
    }
  }
  return undefined;
}

/**
 * Map one directory entry to a skill file, or `undefined` when it is not one.
 * The resolved kind is authoritative: only real files may be flat skills, and
 * only real directories may be bundles.
 */
function locatorForEntry(
  root: string,
  name: string,
  kind: 'directory' | 'file' | undefined,
): EntryLocator | undefined {
  if (kind === 'directory') {
    return { path: join(root, name, 'SKILL.md'), directory: join(root, name), expectedName: name };
  }
  if (kind === 'file' && name.toLowerCase().endsWith('.md')) {
    const base = name.slice(0, -'.md'.length);
    if (base.length === 0) return undefined;
    return { path: join(root, name), directory: root, expectedName: base };
  }
  return undefined;
}

/** Absence, wrong path shape, or a directory where a file was expected. */
function isNotReadableSkillFileError(error: unknown): boolean {
  return isAbsentPathError(error) || hasErrorCode(error, 'EISDIR');
}

function isAbsentPathError(error: unknown): boolean {
  return hasErrorCode(error, 'ENOENT') || hasErrorCode(error, 'ENOTDIR');
}

function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === code;
}
