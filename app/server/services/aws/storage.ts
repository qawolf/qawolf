import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { createRequest } from "@aws-sdk/util-create-request";
import { formatUrl } from "@aws-sdk/util-format-url";

import environment from "../../environment";
import { SaveArtifacts } from "../../types";

const client = new S3({
  credentials: {
    accessKeyId: environment.QAWOLF_AWS_ACCESS_KEY_ID,
    secretAccessKey: environment.QAWOLF_AWS_SECRET_ACCESS_KEY,
  },
  region: environment.QAWOLF_AWS_REGION,
});

const expiresInSeconds = 35 * 60;

export const createStorageReadAccessUrl = (fileName: string): string => {
  return `https://${environment.QAWOLF_AWS_S3_BUCKET}.s3.${environment.QAWOLF_AWS_REGION}.amazonaws.com/${fileName}`;
};

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-creating-buckets.html#s3-create-presigendurl
export const createStorageWriteAccessUrl = async (
  fileName: string
): Promise<string> => {
  const signer = new S3RequestPresigner({ ...client.config });

  const request = await createRequest(
    client,
    new PutObjectCommand({
      Bucket: environment.QAWOLF_AWS_S3_BUCKET,
      Key: fileName,
    })
  );

  const signedRequest = await signer.presign(request, {
    expiresIn: expiresInSeconds,
  });

  const url = formatUrl(signedRequest);

  return url;
};

export const getArtifactsOptions = async (
  name: string
): Promise<SaveArtifacts> => {
  const gifFileName = `${name}.gif`;
  const jsonFileName = `${name}.json`;
  const logsFileName = `${name}.txt`;
  const videoFileName = `${name}.mp4`;

  return {
    gifUrl: await createStorageWriteAccessUrl(gifFileName),
    jsonUrl: await createStorageWriteAccessUrl(jsonFileName),
    logsUrl: await createStorageWriteAccessUrl(logsFileName),
    videoUrl: await createStorageWriteAccessUrl(videoFileName),
  };
};
