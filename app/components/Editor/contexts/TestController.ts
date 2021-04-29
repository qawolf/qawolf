import { EventEmitter } from "events";

import { updateTestMutation } from "../../../graphql/mutations";
import { client } from "../../../lib/client";
import { RunnerClient } from "../../../lib/runner";
import { CodeUpdate, Run, Test } from "../../../lib/types";

export const PATCH_HANDLE = "// 🐺 QA Wolf will create code here";

// Sync the test code between the database and runner.
// We do this outside of hooks to avoid performance overhead.
export class TestController extends EventEmitter {
  _code = "";
  _run: Run | null = null;
  _runner: RunnerClient | null = null;
  _id = "";

  _emitGeneratedLines(newCode: string): void {
    const lines = this._code.split("\n").length;
    const newLines = newCode.split("\n").length;
    const diff = Math.max(newLines - lines, 0);
    if (diff > 0) this.emit("generatedlines", diff);
  }

  _onRunnerUpdate = ({ code, generated, test_id }: CodeUpdate): void => {
    if (this._run || test_id !== this._id) return;

    if (generated) this._emitGeneratedLines(code);
    this._code = code;
    this._saveTest();
    this.emit("codeupdated", code);
  };

  _saveTest(): void {
    client.mutate({
      mutation: updateTestMutation,
      variables: { code: this._code, id: this._id },
    });
  }

  close(): void {
    this._runner?.off("codeupdated", this._onRunnerUpdate);
  }

  get code(): string {
    return this._code;
  }

  get id(): string {
    return this._id;
  }

  setRunner(runner: RunnerClient): void {
    if (this._runner) {
      this._runner.off("codeupdated", this._onRunnerUpdate);
    }

    this._runner = runner;
    this._runner?.on("codeupdated", this._onRunnerUpdate);
  }

  setTest(test: Test | null, run: Run | null): void {
    this._run = run;

    const newCode = run ? run.code : test?.code || "";
    const codeChanged = newCode !== this._code;

    this._code = newCode;
    this._id = test?.id || "";

    if (codeChanged) this.emit("codeupdated", this._code);
  }

  updateCode(code: string): void {
    if (this._run || code === this._code) return;

    this._code = code;
    this._runner?.updateTest({
      code: this._code,
      test_id: this._id,
    });
    this._saveTest();
    this.emit("codeupdated", code);
  }
}
