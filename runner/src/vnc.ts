import { execSync } from "child_process";
import { promises as fs } from "fs";

const VNC_DIR = "/root/.vnc";
const PASSWD_PATH = `${VNC_DIR}/passwd`;

export const setVncPassword = async (password: string): Promise<void> => {
  try {
    await fs.mkdir(VNC_DIR);
  } catch (e) {
    if (e.code !== "EEXIST") {
      throw e;
    }
  }

  execSync(`vncpasswd -f <<< ${password} > "${PASSWD_PATH}"`, {
    shell: "/bin/bash",
  });

  await fs.chmod(PASSWD_PATH, "600");
};
