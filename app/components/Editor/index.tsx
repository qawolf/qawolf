import dynamic from "next/dynamic";
import { ComponentType } from "react";

export default function DynamicEditor(): ComponentType {
  return dynamic(
    async () => {
      const [{ default: Editor }, { useEnsureUser }] = await Promise.all([
        import("./Editor"),
        import("../../hooks/ensureUser"),
      ]);

      return function DynamicEditor() {
        useEnsureUser();

        return <Editor />;
      };
    },
    {
      ssr: false,
    }
  );
}
