import { spawnAsync } from './util';

export async function uninstallLocalPackage(pkgName: string) {
  await spawnAsync(`npm uni ${pkgName}`);
}
