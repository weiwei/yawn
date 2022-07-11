# yawn - A yarn workspace demo

## Init the project

```sh
mkdir yawn
cd yawn
yarn init -2
```

This will create for you the following:

* `.yarn` - A folder containing the yarn script itself as well as various yarn plugins you might install later. I think this is a clever idea, because you are guaranteed to be using the exact same version of `yarn` even if you work on different machines.
* `.editorconfig` - Modern editors will read this config file to enforce encodings line-endings etc.
* `.gitignore` - It contains yarn related files that needs to be ignored. More on it later.
* `.yarnrc.yml` - Yarn config for the repo, equivalent of `.npmrc`.
* `package.json` - A bare-bone  package config file.
* `README.md` - A dummy readme file.
* `yarn.lock` - The version lock file. For now it is empty.
