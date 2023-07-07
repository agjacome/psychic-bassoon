import * as dotEnvConfig from 'dotenv-defaults/config';
import * as dotEnvExpand from 'dotenv-expand';

dotEnvExpand.expand(dotEnvConfig);

export function getEnvStr(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export function getEnvNum(key: string, defaultValue: number): number {
  return Number(process.env[key]) ?? defaultValue;
}
