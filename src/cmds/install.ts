import { Argv } from "yargs";
import { installLocalPackage } from '../installLocalPackage';
import { Dependencies, modifyPackageJson, readPackageConf } from '../util';
import { relative } from "path";
import { cwd } from "process";

export const command = ["install [path..]", "i"];

export const describe = "install local packages";

export function builder(yargs: Argv) {
  return yargs.positional("path", {
    type: "string",
    array: true,
  }).options({
    "save-dev": {
      alias: "D",
      boolean: true,
    },
  });
}

export async function handler(argv: ReturnType<typeof builder>['argv']) {
  argv = await argv;

  const { path, "save-dev": saveDev } = argv;

  if (path?.length) {
    const installed: Dependencies = {};

    for (const p of path) {
      const pkgName = await installLocalPackage(p, { saveDev });

      installed[pkgName] = relative(cwd(), p);
    }

    modifyPackageJson(conf => {
      for (const pkgName of Object.keys(installed)) {
        if (conf.dependencies) {
          delete conf.dependencies[pkgName];
        }

        if (conf.devDependencies) {
          delete conf.devDependencies[pkgName];
        }
      }

      if (!saveDev) {
        const { dependencies = {} } = conf;
        return {
          ...conf,
          dependencies: { ...dependencies, ...installed },
        };
      } else {
        const { devDependencies = {} } = conf;
        return {
          ...conf,
          devDependencies: { ...devDependencies, ...installed },
        };
      }
    });
  } else {
    const conf = await readPackageConf();

    for (const p of Object.values(conf.dependencies ?? {})) {
      await installLocalPackage(p, {});
    }

    for (const p of Object.values(conf.devDependencies ?? {})) {
      await installLocalPackage(p, { saveDev: true });
    }
  }
}
