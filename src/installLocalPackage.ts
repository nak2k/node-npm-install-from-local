import { readPackageJson, spawnAsync } from './util';
import { join } from "path";

export interface InstallLocalPackageOptions {
  saveDev?: boolean;
}

export async function installLocalPackage(pkgDir: string, options: InstallLocalPackageOptions) {
  const pkg = await readPackageJson(join(pkgDir, "package.json"));

  await spawnAsync("npm pack", { cwd: pkgDir });

  await spawnAsync(`npm uni ${pkg.name}`);

  const optionArgs: string[] = [];

  if (options.saveDev) {
    optionArgs.push("--save-dev");
  }

  const tarballPath = join(pkgDir, tarballName(pkg));
  await spawnAsync(`npm i ${optionArgs.join(" ")} ${tarballPath}`);

  return pkg.name;
}

function tarballName(pkg: any) {
  let name: string = pkg.name;

  if (name.startsWith('@')) {
    name = name.substr(1);
  }

  name = name.replace(/\//g, "-");

  return `${name}-${pkg.version}.tgz`;
}
