import * as dotEnvConfig from 'dotenv-defaults/config';
import * as dotEnvExpand from 'dotenv-expand';

dotEnvExpand.expand(dotEnvConfig);

export function getEnvStr(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export function getEnvNum(key: string, defaultValue: number): number {
  return Number(process.env[key]) ?? defaultValue;
}

export function noop(): void {
  return;
}

export const ServiceLocator = (() => {
  const services: Map<string, () => unknown> = new Map<string, () => unknown>();

  const singleton = <A>(cons: () => A): (() => A) => {
    let instance: A | null = null;

    return () => {
      if (instance === null) {
        instance = cons();
        return instance;
      }

      return instance;
    };
  };

  const register = <A>(name: string, cons: () => A): void => {
    if (!services.has(name)) {
      services.set(
        name,
        singleton(() => cons())
      );
    }
  };

  const resolve = <A>(name: string): A => {
    const instance = services.get(name);

    if (instance === undefined) {
      throw new Error(`ServiceLocator: ${name} is not registered.`);
    }

    return instance() as A;
  };

  return { register, resolve };
})();
