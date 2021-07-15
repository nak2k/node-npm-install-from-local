import { Argv } from "yargs";
import { uninstallLocalPackage } from '../uninstallLocalPackage';
import { Conf, modifyPackageJson } from '../util';

export const command = ["uninstall [pkg..]", "uni"];

export const describe = "uninstall local packages";

export function builder(yargs: Argv) {
  return yargs.positional("pkg", {
    type: "string",
    array: true,
  });
}

export async function handler(argv: ReturnType<typeof builder>['argv']) {
  const { pkg } = await argv;

  if (!pkg?.length) {
    return;
  }

  const installed: Conf = {};

  for (const p of pkg) {
    await uninstallLocalPackage(p);
  }

  modifyPackageJson(conf => {
    for (const p of pkg) {
      if (conf.dependencies) {
        delete conf.dependencies[p];
      }

      if (conf.devDependencies) {
        delete conf.devDependencies[p];
      }
    }

    return conf;
  });
}
