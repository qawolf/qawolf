import {
  buildStepsCode,
  BuildStepsOptions,
  buildInitialCode,
  InitialCodeOptions
} from "@qawolf/build-code";
import { Step } from "@qawolf/types";
import { outputFile, pathExists, readFile, remove } from "fs-extra";
import { relative } from "path";
import { patchCode, PATCH_HANDLE } from "./patchCode";
import { removeLinesIncluding } from "./format";

export type CodeFileOptions = Omit<InitialCodeOptions, "patchHandle"> & {
  path: string;
};

type PatchOptions = {
  removeHandle?: boolean;
  steps: Step[];
};

export class CodeFile {
  private _commitedStepIndex: number = 0;
  private _isTest: boolean;
  private _lock: boolean;
  private _name: string;
  private _path: string;

  // public for tests
  public _preexisting: string | undefined;

  protected constructor({ isTest, name, path }: CodeFileOptions) {
    this._isTest = !!isTest;
    this._name = name;
    this._path = path;
  }

  public static async loadOrCreate(options: CodeFileOptions) {
    const file = new CodeFile(options);

    file._preexisting = await loadFileIfExists(options.path);

    if (!file._preexisting) {
      await createInitialCode(options);
    }

    return file;
  }

  private async _preparePatch(options: PatchOptions) {
    // patch non-committed (new) steps
    const stepsToPatch = options.steps.slice(this._commitedStepIndex);
    if (!stepsToPatch.length && !options.removeHandle) {
      // nothing to patch
      return;
    }

    const code = await loadFileIfExists(this._path);
    if (!code) {
      throw new Error("No code to patch");
    }

    let patch = buildPatch({
      isTest: this._isTest,
      // we need to pass all steps so the page options are built properly
      startIndex: this._commitedStepIndex,
      steps: options.steps
    });

    let codeWithPatch = patchCode({ code, patch });
    if (options.removeHandle) {
      codeWithPatch = removeLinesIncluding(codeWithPatch, PATCH_HANDLE);
    }

    return { code: codeWithPatch, steps: stepsToPatch };
  }

  public async discard() {
    if (this._preexisting) {
      await outputFile(this._path, this._preexisting, "utf8");
    } else {
      await remove(this._path);
    }
  }

  public hasPreexisting() {
    return !!this._preexisting;
  }

  public isTest() {
    return this._isTest;
  }

  public name() {
    return this._name;
  }

  async patch(options: PatchOptions) {
    if (this._lock) {
      // do not conflict with a patch in progress
      return;
    }

    const patch = await this._preparePatch(options);
    if (!patch) return;

    this._lock = true;
    await outputFile(this._path, patch.code, "utf8");
    this._commitedStepIndex += patch.steps.length;
    this._lock = false;
  }

  public relativePath() {
    return relative(process.cwd(), this._path);
  }
}

export const buildPatch = (options: BuildStepsOptions) => {
  let patch = buildStepsCode(options);

  // include the patch symbol so we can replace it later
  patch += PATCH_HANDLE;

  return patch;
};

export const createInitialCode = async (options: CodeFileOptions) => {
  const initialCode = buildInitialCode({
    ...options,
    patchHandle: PATCH_HANDLE
  });

  await outputFile(options.path, initialCode, "utf8");
};

export const loadFileIfExists = async (
  path: string
): Promise<string | undefined> => {
  const codeExists = await pathExists(path);
  if (!codeExists) return undefined;

  const file = await readFile(path, "utf8");
  return file;
};
