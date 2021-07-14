import { readPackageJson, spawnAsync } from './util';
import { join } from "path";

export async function installLocalPackage(pkgDir: string) {
  const pkg = await readPackageJson(join(pkgDir, "package.json"));

  await spawnAsync("npm pack", { cwd: pkgDir, shell: true });

  await spawnAsync(`npm uni ${pkg.name}`, { shell: true });

  await spawnAsync(`npm i ` + join(pkgDir, tarballName(pkg)), { shell: true });

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
