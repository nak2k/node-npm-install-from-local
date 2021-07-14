import { readFile, writeFile } from "fs/promises";
import { spawn, SpawnOptionsWithoutStdio } from "child_process";

export interface Conf {
  /**
   * Mapping package names to paths.
   */
  [pkgName: string]: string;
}

const CONF_KEY = "npm-install-from-local";

export async function modifyPackageJson(modifier: (conf: Conf) => Conf) {
  const pkg = await readPackageJson("package.json");

  const result = modifier(pkg[CONF_KEY] || {});

  if (isEmpty(result)) {
    pkg[CONF_KEY] = undefined;
  } else {
    pkg[CONF_KEY] = sortProps(result);
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

  if (conf !== undefined && typeof conf !== 'object') {
    throw new Error(`The property "${CONF_KEY}" in the package.json must be an object`);
  }


  return conf;
}

function isEmpty(obj: any) {
  return Object.keys(obj).length === 0;
}

function sortProps<T extends { [name: string]: unknown }>(obj: T): T {
  return Object.keys(obj).sort().reduce<T>(
    (result, name) => ((result as any)[name] = obj[name], result),
    {} as T
  );
}

export async function spawnAsync(command: string, options?: SpawnOptionsWithoutStdio) {
  const p = spawn(command, options);

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
