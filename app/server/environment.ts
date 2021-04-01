/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";

import { RunnerLocations } from "./types";

dotenv.config(process.env.DOTENV_PATH ? { path: process.env.DOTENV_PATH } : {});

const databaseSsl = process.env.DATABASE_SSL;

export default {
  APP_URL: process.env.APP_URL!,
  AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID!,
  AZURE_DOMAIN_ID: process.env.AZURE_DOMAIN_ID!,
  AZURE_REGISTRY_PASSWORD: process.env.AZURE_REGISTRY_PASSWORD!,
  AZURE_REGISTRY_SERVER: process.env.AZURE_REGISTRY_SERVER!,
  AZURE_REGISTRY_USERNAME: process.env.AZURE_REGISTRY_USERNAME!,
  AZURE_RESOURCE_GROUP: process.env.AZURE_RESOURCE_GROUP!,
  AZURE_SECRET: process.env.AZURE_SECRET!,
  AZURE_SUBSCRIPTION_ID: process.env.AZURE_SUBSCRIPTION_ID!,
  AZURE_WORKSPACE_ID: process.env.AZURE_WORKSPACE_ID!,
  AZURE_WORKSPACE_KEY: process.env.AZURE_WORKSPACE_KEY!,
  DATABASE_SSL: databaseSsl ? JSON.parse(databaseSsl) : null,
  DATABASE_URL: process.env.DATABASE_URL,
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN!,
  ENCRYPT_IV: process.env.ENCRYPT_IV,
  ENCRYPT_KEY: process.env.ENCRYPT_KEY,
  GITHUB_APP_CLIENT_ID: process.env.GITHUB_APP_CLIENT_ID!,
  GITHUB_APP_CLIENT_SECRET: process.env.GITHUB_APP_CLIENT_SECRET!,
  GITHUB_APP_ID: process.env.GITHUB_APP_ID!,
  GITHUB_OAUTH_CLIENT_ID: process.env.GITHUB_OAUTH_CLIENT_ID!,
  GITHUB_OAUTH_CLIENT_SECRET: process.env.GITHUB_OAUTH_CLIENT_SECRET!,
  GITHUB_USER_AGENT: process.env.GITHUB_USER_AGENT!,
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET!,
  INTERCOM_IDENTITY_SECRET: process.env.INTERCOM_IDENTITY_SECRET || "secret",
  IPSTACK_API_KEY: process.env.IPSTACK_API_KEY!,
  JOB_SECRET: process.env.JOB_SECRET!,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION!,
  JWT_SECRET: process.env.JWT_SECRET!,
  NODE_ENV: process.env.NODE_ENV || "development",
  RUNNER_IMAGE: process.env.RUNNER_IMAGE!,
  RUNNER_LOCATIONS: JSON.parse(
    process.env.RUNNER_LOCATIONS || "{}"
  ) as RunnerLocations,
  QAWOLF_AWS_ACCESS_KEY_ID: process.env.QAWOLF_AWS_ACCESS_KEY_ID!,
  QAWOLF_AWS_REGION: process.env.QAWOLF_AWS_REGION!,
  QAWOLF_AWS_SECRET_ACCESS_KEY: process.env.QAWOLF_AWS_SECRET_ACCESS_KEY!,
  QAWOLF_AWS_S3_BUCKET: process.env.QAWOLF_AWS_S3_BUCKET!,
  SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY || "",
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
  SENDGRID_WEBHOOK_SECRET: process.env.SENDGRID_WEBHOOK_SECRET!,
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID!,
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET!,
  SLACK_UPDATES_WEBHOOK: process.env.SLACK_UPDATES_WEBHOOK || null,
  STRIPE_API_KEY: process.env.STRIPE_API_KEY!,
  VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || "",
  VERCEL_URL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null,
};
