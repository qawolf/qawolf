/* eslint-disable @typescript-eslint/no-non-null-assertion */
import dotenv from "dotenv";

dotenv.config(process.env.DOTENV_PATH ? { path: process.env.DOTENV_PATH } : {});

const databaseSsl = process.env.DATABASE_SSL;

export default {
  APP_URL: process.env.APP_URL!,
  DATABASE_SSL: databaseSsl ? JSON.parse(databaseSsl) : null,
  DATABASE_URL: process.env.DATABASE_URL,
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN!,
  ENCRYPT_IV: process.env.ENCRYPT_IV,
  ENCRYPT_KEY: process.env.ENCRYPT_KEY,
  GITHUB_APP_ID: process.env.GITHUB_APP_ID!,
  GITHUB_OAUTH_CLIENT_ID: process.env.GITHUB_OAUTH_CLIENT_ID!,
  GITHUB_OAUTH_CLIENT_SECRET: process.env.GITHUB_OAUTH_CLIENT_SECRET!,
  GITHUB_SYNC_APP_ID: process.env.GITHUB_SYNC_APP_ID!,
  GITHUB_USER_AGENT: process.env.GITHUB_USER_AGENT!,
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET!,
  INTERCOM_IDENTITY_SECRET: process.env.INTERCOM_IDENTITY_SECRET || "secret",
  IPSTACK_API_KEY: process.env.IPSTACK_API_KEY!,
  JOB_SECRET: process.env.JOB_SECRET!,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION!,
  JWT_SECRET: process.env.JWT_SECRET!,
  NODE_ENV: process.env.NODE_ENV || "development",
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
  STRIPE_BASE_PRICE_ID: process.env.STRIPE_BASE_PRICE_ID!,
  STRIPE_METERED_PRICE_ID: process.env.STRIPE_METERED_PRICE_ID!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || "",
  VERCEL_URL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null,
};
