import {
  buildInitialCode,
  buildVirtualCode,
  CodeReconciler,
  InitialCodeOptions
} from "@qawolf/build-code";
import { Step } from "@qawolf/types";
import { outputFile, pathExists, readFile, remove } from "fs-extra";
import { relative } from "path";
import { removeLinesIncluding } from "./format";
import { PATCH_HANDLE } from "./patchCode";

export type CodeFileOptions = Omit<InitialCodeOptions, "patchHandle"> & {
  path: string;
};

type UpdateOptions = {
  removeHandle?: boolean;
  steps: Step[];
};

export class CodeFile {
  private _isTest: boolean;
  private _lock: boolean;
  private _name: string;
  private _path: string;
  // public for tests
  public _preexisting: string | undefined;
  private _reconciler: CodeReconciler;

  protected constructor({ isTest, name, path }: CodeFileOptions) {
    this._isTest = !!isTest;
    this._name = name;
    this._path = path;
    this._reconciler = new CodeReconciler();
  }

  public static async loadOrCreate(options: CodeFileOptions) {
    const file = new CodeFile(options);

    file._preexisting = await loadFileIfExists(options.path);

    if (!file._preexisting) {
      await createInitialCode(options);
    }

    return file;
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

  public relativePath() {
    return relative(process.cwd(), this._path);
  }

  public async update(options: UpdateOptions) {
    // do not conflict with an update in progress
    if (this._lock) return;

    const virtualCode = buildVirtualCode(options.steps, this._isTest);
    if (!options.removeHandle && !this._reconciler.hasUpdates(virtualCode)) {
      return;
    }

    const actualCode = await loadFileIfExists(this._path);
    if (!actualCode) {
      throw new Error(`Could not find code to update at ${this._path}`);
    }

    this._lock = true;

    let reconciledCode = this._reconciler.reconcile({
      actualCode,
      virtualCode
    });

    if (options.removeHandle) {
      reconciledCode = removeLinesIncluding(reconciledCode, PATCH_HANDLE);
    }

    await outputFile(this._path, reconciledCode, "utf8");

    this._reconciler.update(virtualCode);

    this._lock = false;
  }
}

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
