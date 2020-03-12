import { config as configEnv } from 'dotenv';

const dotEnvPath = process.env.QAW_DOTENV_PATH;
configEnv(dotEnvPath ? { path: dotEnvPath } : {});
