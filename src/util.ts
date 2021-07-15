import { readFile, writeFile } from "fs/promises";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";

/**
 * Mapping package names to paths.
 */
export interface Dependencies {
  [pkgName: string]: string;
}

export interface Conf {
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
}

const CONF_KEY = "npm-install-from-local";

export async function modifyPackageJson(modifier: (conf: Conf) => Conf) {
  const pkg = await readPackageJson("package.json");

  const conf = modifier(pkg[CONF_KEY] || {});

  if (conf.dependencies === undefined || isEmptyObject(conf.dependencies)) {
    delete conf.dependencies;
  } else {
    conf.dependencies = sortProps(conf.dependencies);
  }

  if (conf.devDependencies === undefined || isEmptyObject(conf.devDependencies)) {
    delete conf.devDependencies;
  } else {
    conf.devDependencies = sortProps(conf.devDependencies);
  }

  if (isEmptyObject(conf)) {
    delete pkg[CONF_KEY];
  } else {
    pkg[CONF_KEY] = conf;
  }

  await writeFile("package.json", JSON.stringify(pkg, null, 2) + "\n");
}

export async function readPackageJson(path: string) {
  const data = await readFile(path, "utf-8");

  const pkg = JSON.parse(data);

  return pkg;
}

export async function readPackageConf(): Promise<Conf> {
  const conf = (await readPackageJson("package.json"))[CONF_KEY] || {};

  if (conf === undefined) {
    return conf;
  }

  if (typeof conf !== 'object') {
    throw new Error(`The property "${CONF_KEY}" in the package.json must be an object`);
  }

  if (conf.dependencies !== undefined && typeof conf.dependencies !== 'object') {
    throw new Error(`The property "${CONF_KEY}.dependencies" in the package.json must be an object`);
  }

  if (conf.devDependencies !== undefined && typeof conf.devDependencies !== 'object') {
    throw new Error(`The property "${CONF_KEY}.devDependencies" in the package.json must be an object`);
  }

  return conf;
}

function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}

function sortProps<T extends { [name: string]: unknown }>(obj: T): T {
  return Object.keys(obj).sort().reduce<T>(
    (result, name) => ((result as any)[name] = obj[name], result),
    {} as T
  );
}

export async function spawnAsync(command: string, options: SpawnOptionsWithoutStdio = {}) {
  const p = spawn(command, { shell: true, ...options });

  return new Promise<void>((resolve, reject) => {
    return p
      .on('exit', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Exit code ${code}`));
        }
      })
      .on('error', reject);
  });
}
