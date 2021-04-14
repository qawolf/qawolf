import retry from "async-retry";
import axios, { AxiosRequestConfig } from "axios";
import Debug from "debug";
import { createReadStream, ReadStream, statSync } from "fs";

const debug = Debug("qawolf:aws");

type UploadFile = {
  contentType?: string;
  data?: string;
  savePath?: string;
  url: string;
};

export const uploadFile = async ({
  contentType,
  data,
  savePath,
  url,
}: UploadFile): Promise<void> => {
  if (!data && !savePath) {
    throw new Error("Must provide data or save path");
  }

  debug(`upload ${savePath || "data"} to ${url}`);

  try {
    const headers: AxiosRequestConfig["headers"] = {
      "content-type": contentType || "application/octet-stream",
    };

    let body: ReadStream | string = data || "";

    if (savePath) {
      body = createReadStream(savePath);

      const { size } = statSync(savePath);
      headers["content-length"] = size;
    }

    await retry(
      async (_, attempt) => {
        debug(`upload attempt ${attempt} for ${savePath} to ${url}`);

        await axios.put(url, body, {
          headers,
          maxBodyLength: Infinity,
        });
      },
      { retries: 3 }
    );

    debug(`uploaded ${savePath || "data"} to ${url}`);
  } catch (error) {
    debug("error uploading file", error.response);
  }
};
