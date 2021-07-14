import { Argv } from "yargs";
import { installLocalPackage } from '../installLocalPackage';
import { Conf, modifyPackageJson, readPackageConf } from '../util';
import { relative } from "path";
import { cwd } from "process";

export const command = ["install [path..]", "i"];

export const describe = "install local packages";

export function builder(yargs: Argv) {
  return yargs.positional("path", {
    type: "string",
    array: true,
  });
}

export async function handler(argv: ReturnType<typeof builder>['argv']) {
  const { path } = await argv;

  if (path?.length) {
    const installed: Conf = {};

    for (const p of path) {
      const pkgName = await installLocalPackage(p);

      installed[pkgName] = relative(cwd(), p);
    }

    modifyPackageJson(conf => {
      return { ...conf, ...installed };
    });
  } else {
    for (const p of Object.values(await readPackageConf())) {
      await installLocalPackage(p);
    }
  }
}
