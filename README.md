# npm-install-from-local

Install packages from local.

## Installation

```
npm i -D npm-install-from-local
npm set-script postinstall "npm-install-from-local install"
```

## Usage

```
npm-install-from-local <command>

Commands:
  npm-install-from-local install [path..]   install local packages  [aliases: i]
  npm-install-from-local uninstall [pkg..]  uninstall local packages
                                                                  [aliases: uni]
  npm-install-from-local completion         generate completion script

Options:
  -v, --verbose  Verbose mode                                          [boolean]
      --version  Show version number                                   [boolean]
      --help     Show help                                             [boolean]
```

## License

MIT
