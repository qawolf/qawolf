import axios, { AxiosRequestConfig } from "axios";
import Debug from "debug";
import { createReadStream, ReadStream, statSync } from "fs";

const debug = Debug("qawolf:aws");

type UploadFile = {
  data?: string;
  savePath?: string;
  url: string;
};

export const uploadFile = async ({
  data,
  savePath,
  url,
}: UploadFile): Promise<void> => {
  debug(`upload ${savePath ? " from " + savePath : "data"}`);

  if (!data && !savePath) {
    throw new Error("Must provide data or save path");
  }

  try {
    const headers: AxiosRequestConfig["headers"] = {
      "content-type": "application/octet-stream",
    };

    let body: ReadStream | string = data || "";

    if (savePath) {
      body = createReadStream(savePath);

      const { size } = statSync(savePath);
      headers["content-length"] = size;
    }

    await axios.put(url, body, {
      headers,
      maxBodyLength: Infinity,
    });

    debug("uploaded file");
  } catch (error) {
    debug("error uploading file", error.response);
  }
};
