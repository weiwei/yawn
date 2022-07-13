# yawn - A yarn workspace demo

Note that this document intends to mirror an actual work project, so I choose to use less yarn specific features and to use Webpack, not some popular guys on the stage.

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

## Configure Workspace

Add the following line to `package.json`:

```json
"workspaces": ["packages/*"]
```

This tells `yarn` to look for workspace packages under `packages` folder. 

That's it. The workspace configuration is this simple.

## Create packages

Now create some packages in the workspace.

```sh
mkdir packages
cd packages
mkdir foo bar
```

Run `yarn init` inside `foo` and `bar`. This generates `README.md` and `package.json` in both folders.

It is customary to use namespaces for your package names. This avoids strange name clashes. Go change the `name` field and add `@yawn/` before it, e.g., `foo` to `@yawn/foo`. From then on, we'll refer the package in our code as `@yawn/foo` in dependency management and in package imports.

Now back to root folder and run `yarn install`. This will resolve the newly created packages and undate the lockfile.

Since we'll be creating Typescript packages with Jest, now go back to repo root and install some rudimentary packages:

```sh
yarn add --dev typescript jest @types/jest ts-node ts-jest @types/node
```

This way we have packages installed globally. This way we'll have exactly one place to manage all the dev dependencies, but the downside is that the commands only exists in the global scope. You'll see in the next section.

## Typescript config

Now we run `tsc --init` command to generate a default Typescript config for each package. As mentioned above, if the dependency is installed globally, you need to run `yarn WORKSPACE` commands to execute them in each package.

The following WON'T work:

```sh
cd packages/foo
yarn tsc --init
Usage Error: Couldn't find a script named "tsc".
```

Instead you have to do this:

```sh
cd packages/foo
yarn ./ run -T tsc --init
```

Or do this if you prefer to stay in the root folder:

```sh
yarn packages/foo run -T tsc --init
```

Do the same for all your packages.

TIP: `yarn COMMAND` is equivalent to `yarn run COMMAND`, but when you use `yarn run`, you get the chance to add parameters for `yarn run` itself.

## Add some code

We'll write something inside `@yawn/foo`, and use it in `@yawn/bar`. The code will be very simple:

Create `index.ts` inside `foo` with the following content:

```ts
export const FOO = 3;
```

Create `index.ts` inside `bar` with the following content:

```ts
import { FOO } from "@yawn/foo"

export const BAR = FOO * 2
```

If your editor reports an error for the import line, run `yarn install` at root, the error should go away.

But how do we know it works? We need to write some tests, but first we need configure the test environment.

## Configure jest

Run the following command in each package, where WORKSPACE can be `packages/foo` or `packages/bar`:

```sh
yarn WORKSPACE run -T jest --init
```

* Would you like to use Jest when running "test" script in "package.json"? » Y (But we'll need to change it later)
* Would you like to use Typescript for the configuration file? » Y (Why not)
* Choose the test environment that will be used for testing » node (We can use default for now)
* Do you want Jest to add coverage reports? » N (What's the point)
* Which provider should be used to instrument code for coverage? » v8 (Just keep the default)
* Automatically clear mock calls, instances, contexts and results before every test? » N (Keep default)

Do the same for all packages.

## Create tests

Create `index.test.ts` inside `foo` with the following content:

```ts
import { FOO } from "."

test("FOO", () => {
    expect(FOO).toEqual(3)
})
```

And for `bar/index.test.ts`:

```ts
import { BAR } from "."
import { FOO } from "@yawn/foo"
test("BAR", () => {
    expect(BAR).toEqual(FOO * 2)
    expect(BAR).toEqual(6)
})
```

Now run test for each package (substitute `WORKSPACE` with `packages/foo`, etc.):

```sh
yarn WORKSPACE run -T jest
```

All tests should pass, which means the workspaces work fine.

## How dependencies work

When we run `yarn install`, the `foo` and `bar` packages will be "installed" inside `node_modules`. It isn't a real install though, just a symlink to the actual package folder.

When we import a package in `import { FOO } from "@yawn/foo"`, it will actually find the package inside `node_modules`, then trace back to the actual `packages/foo` folder to resolve the import.

This mechanism allows packages to refer one another without adding dependencies inside `package.json`, i.e., we don't need to add `"@yawn/foo"` as a dependency inside `packages/bar/package.json`.

However, a package may have different versions located in a NPM package registry or locally. To make sure we're referring to the right one, it's good practice to add explicitly all the package dependencies. so in `packages/bar/package.json`, we should add this section:

```json
  "dependencies": {
    "@yawn/foo": "workspace:*"
  }
```

The `"workspace:*"` part is `yarn` and `pnpm` specific. It tells the tools that we'll be using workspace packages, nothing else. For now it doesn't work well with `lerna`, but there is hope that it may work later. More on this later.

A caveat: The `index.ts` files have to stay in the package root directory (`packages/foo/index.ts`) in order to work. In theory, you could put it under a subfolder, such as `packages/foo/src/index.ts`, but you need to update the `main` entry inside `package.json` and set it to `./src/index.ts`. This is not ideal, because when we publish the package, all Typescript will be transpiled to Javascript, and this `main` entry should be pointing to the transpile result, something like `lib/index.js`. Therefore, it should be a good idea to just create `index.ts` at package root.


## Add a workspace script

In `packages/foo/package.json`, add the following:

```json
  "scripts": {
    "test": "run -T jest"
  }
```

We're using the global jest install, to  so the `run -T` is necessary.

Do the same for `packages/bar/package.json`.

Now if you cd to `foo` or `bar`, you can run `yarn test` under that directory to run unit tests.

## Yarn foreach

Yarn has plugins that facilitates monorepo scripts. Follow [the official doc](https://yarnpkg.com/cli/workspaces/foreach) and install the plugin:

```sh
yarn plugin import workspace-tools
```

Now in the project root run `yarn workspaces foreach run test`. This will execute `yarn test` in all your workspaces.

## Build

The build step generates something that's ready to be deployed or used directly. In our simple example, we'll generate a Javascript file that when we run it, it prints out the `BAR` value it contains. Real apps have more complex builds, but this should be sufficient for a demo.

We'll be using the old school webpack for this. First install webpack in the project level.

```sh
yarn add --dev webpack webpack-cli ts-loader
```

Create webpack config inside `foo` and `bar`, named `webpack.config.js`, with the following content

```js
const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';


const config = {
    entry: './index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        
    } else {
        config.mode = 'development';
    }
    return config;
};

```

NOTE: This file is generated with `@webpack/generators` and `webpack init`, then stripped some unnecessary things away.

This will bundle the Typescript package into a `dist/main.js` file.

BTW, add `**/dist` into your `.gitignore` to skip built files.

Also add build script into `package.json` files:

```json
  "scripts": {
    "test": "yarn run -T jest",
    "build": "run -T webpack --config webpack.config.js" // Add this line
  }
```

Add the following to `bar/index.ts` so that it actually does something:

```ts
console.log("BAR is", BAR)
```

Now you can run `yarn workspaces foreach run build`.

Run `node packages/bar/dist/main.js`, it will print out the log.

## Publish


## Lerna
