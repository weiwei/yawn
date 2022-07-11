# yawn - A yarn workspace demo

Note that this tutorial intends to use less yarn specific features. You'll see me disabling them in my config. You can skip them if you want these features.

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

## First `yarn install`

Now open the `.yarnrc.yml` file and add this line.

```yaml
nodeLinker: node-modules
```

This disables yarn's plug-and-play feature. More on this later.

Open `.gitignore` and do the following:

* Comment out `!.yarn/cache`.
* Add `node_modules`

Now run `yarn install` or just `yarn` for short. This will install and link all dependencies for you. Now the project is empty, so it will just create a `node_modules` folder and add some dummy entries in `yarn.lock`.

## Workspace

Add the following line to `packag.json`:

```json
"workspaces": ["packages/*"]
```

This tells `yarn` to look for workspace packages under `packages` folder.

## Create packages
