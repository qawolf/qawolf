import {
  buildStepsCode,
  BuildStepsOptions,
  buildInitialCode,
  InitialCodeOptions
} from "@qawolf/build-code";
import { Step } from "@qawolf/types";
import { pathExists, readFile, outputFile, remove } from "fs-extra";
import { relative } from "path";
import { PATCH_HANDLE, patchCode } from "./patchCode";
import { removeLinesIncluding } from "./format";

type ConstructorOptions = Omit<InitialCodeOptions, "patchHandle"> & {
  path: string;
};

type PatchOptions = {
  removeHandle?: boolean;
  steps: Step[];
};

export class CodeFile {
  private _commitedStepIndex: number = 0;
  protected _existingCode: string | undefined;
  private _isTest: boolean;
  private _lock: boolean;
  private _path: string;

  protected constructor({ isTest, path }: ConstructorOptions) {
    this._isTest = !!isTest;
    this._path = path;
  }

  public static async loadOrCreate(options: ConstructorOptions) {
    const codeFile = new CodeFile(options);

    codeFile._existingCode = await loadFileIfExists(options.path);

    if (!codeFile._existingCode) {
      await createInitialCode(options);
    }

    return codeFile;
  }

  protected async _revert() {
    await outputFile(this._path, this._existingCode, "utf8");
  }

  protected async _remove() {
    await remove(this._path);
  }

  public async discard() {
    if (this._existingCode) {
      await this._revert();
    } else {
      await this._remove();
    }
  }

  public name() {}

  async patch(options: PatchOptions) {
    if (this._lock) {
      // do not conflict with a patch in progress
      return;
    }

    // patch non-committed (new) steps
    const stepsToPatch = options.steps.slice(this._commitedStepIndex);
    if (!stepsToPatch.length) {
      // no new steps to patch
      return;
    }

    const code = await loadFileIfExists(this._path);
    if (!code) {
      throw new Error("No code to patch");
    }

    this._lock = true;

    let patch = buildPatch({
      isTest: this._isTest,
      steps: stepsToPatch
    });

    let patchedCode = patchCode({ code, patch });

    if (options.removeHandle) {
      patchedCode = removeLinesIncluding(patchedCode, PATCH_HANDLE);
    }

    await outputFile(this._path, patchedCode, "utf8");

    this._commitedStepIndex += stepsToPatch.length;
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

export const createInitialCode = async (options: ConstructorOptions) => {
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
