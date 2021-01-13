import { createCipheriv, createDecipheriv } from "crypto";

import environment from "../environment";

// use the lines below to generate values
// const key = crypto.randomBytes(32).toString("hex");
// const iv = crypto.randomBytes(16).toString("hex");

type EncryptKeys = {
  iv: string;
  key: string;
};

const ALGORITHM = "aes-256-cbc";

const getEncryptKeys = (): EncryptKeys => {
  if (!environment.ENCRYPT_IV || !environment.ENCRYPT_KEY) {
    throw new Error("Must specify key and iv");
  }

  return { iv: environment.ENCRYPT_IV, key: environment.ENCRYPT_KEY };
};

export const decrypt = (data: string): string => {
  const { iv, key } = getEncryptKeys();

  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  const decrypted = decipher.update(Buffer.from(data, "hex"));

  return Buffer.concat([decrypted, decipher.final()]).toString();
};

export const encrypt = (data: string): string => {
  const { iv, key } = getEncryptKeys();

  const cipher = createCipheriv(
    ALGORITHM,
    Buffer.from(key, "hex"),
    Buffer.from(iv, "hex")
  );
  const encrypted = cipher.update(data);

  return Buffer.concat([encrypted, cipher.final()]).toString("hex");
};
