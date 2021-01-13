import { decrypt, encrypt } from "../../../server/models/encrypt";

const decrypted = "secret value";
const encrypted = "c3f0d9ca5022a96a750544c368e7c5cc";

describe("decrypt", () => {
  it("decrypts a value", () => {
    expect(decrypt(encrypted)).toBe(decrypted);
  });
});

describe("encrypt", () => {
  it("encrypts a value", () => {
    expect(encrypt(decrypted)).toBe(encrypted);
  });
});
