import type * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect } from "react";

import { Env } from "../../../../../lib/types";

const ENV_FILE_NAME = "envTypes.d.ts";

const buildEnvTypes = (env: Env): string => {
  const envTypes = Object.keys(env).map((variableName) => {
    return `${variableName}: string;`;
  });

  return `
declare namespace NodeJS {
    export interface ProcessEnv {
        ${envTypes.join("\n")}
    }

    export interface Process {
      env: ProcessEnv;
    }
}

declare var process: NodeJS.Process;`;
};

type UseEnvTypes = {
  env: Env;
  monaco: typeof monacoEditor | null;
};

export const useEnvTypes = ({ env, monaco }: UseEnvTypes): void => {
  useEffect(() => {
    if (!env || !monaco) return;

    const envTypes = buildEnvTypes(env);

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      envTypes,
      ENV_FILE_NAME
    );
  }, [env, monaco]);
};
