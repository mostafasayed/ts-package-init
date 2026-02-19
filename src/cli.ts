#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import fs from "fs-extra";
import minimist from "minimist";
import { execa } from "execa";

type Preset = "base" | "cli" | "library" | "backend" | "monorepo" | "nestjs" | "moleculer";
type PackageManager = "npm" | "pnpm" | "bun";

type PromptInterface = ReturnType<typeof readline.createInterface>;

const VALID_PRESETS: Preset[] = [
    "base",
    "cli",
    "library",
    "backend",
    "monorepo",
    "nestjs",
    "moleculer"
];
const VALID_PACKAGE_MANAGERS: PackageManager[] = ["npm", "pnpm", "bun"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function die(msg: string): never {
    console.error(`❌ ${msg}`);
    process.exit(1);
}

async function run(cmd: string, args: string[], cwd: string) {
    try {
        await execa(cmd, args, { cwd, stdio: "inherit" });
    } catch (error) {
        die((error as Error)?.message);
    }
}

function getTemplateDir(preset: Preset) {
    return path.resolve(__dirname, `../templates/${preset}`);
}

async function patchTsConfig(targetDir: string, isESM: boolean, preset: Preset) {
    if (!isESM) return;

    const tsConfigPaths = [path.join(targetDir, "tsconfig.json")];

    if (preset === "monorepo") {
        const packagesDir = path.join(targetDir, "packages");
        if (await fs.pathExists(packagesDir)) {
            const entries = await fs.readdir(packagesDir);
            for (const entry of entries) {
                const tsConfigPath = path.join(packagesDir, entry, "tsconfig.json");
                if (await fs.pathExists(tsConfigPath)) {
                    tsConfigPaths.push(tsConfigPath);
                }
            }
        }
    }

    for (const tsConfigPath of tsConfigPaths) {
        const tsconfig = await fs.readJson(tsConfigPath);
        tsconfig.compilerOptions = tsconfig.compilerOptions || {};
        tsconfig.compilerOptions.module = "ES2022";
        tsconfig.compilerOptions.moduleResolution = "Bundler";
        await fs.writeJson(tsConfigPath, tsconfig, { spaces: 2 });
    }
}

function getEslintTemplate(preset: Preset, withPrettier: boolean) {
    const prefix = preset === "library" ? "eslint.library" : "eslint";
    return withPrettier
        ? `${prefix}.prettier.config.js`
        : `${prefix}.config.js`;
}

async function copyEslintConfig(targetDir: string, preset: Preset, withPrettier: boolean) {
    const filename = getEslintTemplate(preset, withPrettier);

    await fs.copy(
        path.resolve(__dirname, `../templates/eslint/${filename}`),
        path.join(targetDir, "eslint.config.js")
    );
}

async function copyPrettierConfig(targetDir: string) {
    await fs.copy(
        path.resolve(__dirname, "../templates/eslint/.prettierrc.json"),
        path.join(targetDir, ".prettierrc.json")
    );
}

function normalizePackageManager(value: string | undefined): PackageManager {
    if (!value) return "npm";
    const normalized = value.toLowerCase();
    if (VALID_PACKAGE_MANAGERS.includes(normalized as PackageManager)) {
        return normalized as PackageManager;
    }
    return value as PackageManager;
}

function getInstallCommand(packageManager: PackageManager, deps: string[], dev: boolean) {
    switch (packageManager) {
        case "pnpm":
            return {
                cmd: "pnpm",
                args: dev ? ["add", "-D", ...deps] : ["add", ...deps]
            };
        case "bun":
            return {
                cmd: "bun",
                args: dev ? ["add", "--dev", ...deps] : ["add", ...deps]
            };
        case "npm":
        default:
            return {
                cmd: "npm",
                args: dev ? ["i", "-D", ...deps] : ["i", ...deps]
            };
    }
}

async function installDependencies(
    packageManager: PackageManager,
    deps: string[],
    dev: boolean,
    cwd: string
) {
    if (deps.length === 0) return;
    const { cmd, args } = getInstallCommand(packageManager, deps, dev);
    await run(cmd, args, cwd);
}

function getFrameworkDependencies(preset: Preset): string[] {
    switch (preset) {
        case "nestjs":
            return [
                "@nestjs/common",
                "@nestjs/core",
                "@nestjs/platform-express",
                "reflect-metadata",
                "rxjs"
            ];
        case "moleculer":
            return ["moleculer"];
        default:
            return [];
    }
}

async function promptText(rl: PromptInterface, question: string) {
    while (true) {
        const answer = (await rl.question(`${question}: `)).trim();
        if (answer) return answer;
    }
}

async function promptYesNo(rl: PromptInterface, question: string, defaultValue: boolean) {
    const hint = defaultValue ? "Y/n" : "y/N";
    while (true) {
        const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
        if (!answer) return defaultValue;
        if (["y", "yes"].includes(answer)) return true;
        if (["n", "no"].includes(answer)) return false;
    }
}

async function promptChoice<T extends string>(
    rl: PromptInterface,
    question: string,
    choices: T[],
    defaultValue: T
) {
    const hint = `${choices.join("/")}`;
    while (true) {
        const answer = (await rl.question(`${question} (${hint}) [${defaultValue}]: `)).trim();
        if (!answer) return defaultValue;
        if (choices.includes(answer as T)) return answer as T;
    }
}

async function patchMonorepoAppPackage(targetDir: string, rootName: string, isESM: boolean) {
    const appPkgPath = path.join(targetDir, "packages", "app", "package.json");
    if (!await fs.pathExists(appPkgPath)) return;

    const appPkg = await fs.readJson(appPkgPath);
    appPkg.name = `${rootName}-app`;
    appPkg.scripts = appPkg.scripts || {};
    appPkg.scripts.build = "tsc -b";
    appPkg.scripts.dev = "tsx watch src/index.ts";
    appPkg.scripts.start = "node dist/index.js";
    appPkg.main = "dist/index.js";
    if (isESM) {
        appPkg.type = "module";
    }

    await fs.writeJson(appPkgPath, appPkg, { spaces: 2 });
}

async function main() {
    const args = minimist(process.argv.slice(2));
    const hasFlag = (key: string) => Object.prototype.hasOwnProperty.call(args, key);

    const yes = hasFlag("yes") ? Boolean(args.yes) : false;
    const interactive = hasFlag("interactive") ? Boolean(args.interactive) : false;
    const hasPreset = hasFlag("preset");
    const hasEsm = hasFlag("esm");
    const hasEslint = hasFlag("eslint");
    const hasPrettier = hasFlag("prettier");
    const hasSkipInstall = hasFlag("skip-install");
    const hasPackageManager = hasFlag("package-manager");
    const hasGit = hasFlag("git");

    let name = args._[0] as string | undefined;
    let preset = (args.preset as Preset | undefined) ?? "base";
    let isESM = hasEsm ? Boolean(args.esm) : false;
    let useEslint = hasEslint ? Boolean(args.eslint) : false;
    let usePrettier = hasPrettier ? Boolean(args.prettier) : false;
    let skipInstall = hasSkipInstall ? Boolean(args["skip-install"]) : false;
    let packageManager = normalizePackageManager(args["package-manager"] as string | undefined);
    let initGit = hasGit ? Boolean(args.git) : false;

    if (interactive && !yes) {
        const rl = readline.createInterface({ input, output });
        try {
            if (!name) {
                name = await promptText(rl, "Package name");
            }
            if (!hasPreset) {
                preset = await promptChoice(rl, "Preset", VALID_PRESETS, "base");
            }
            if (!hasEsm) {
                isESM = await promptYesNo(rl, "Use ESM?", false);
            }
            if (!hasEslint) {
                useEslint = await promptYesNo(rl, "Enable ESLint?", false);
            }
            if (!hasPrettier) {
                usePrettier = await promptYesNo(rl, "Enable Prettier?", false);
            }
            if (!hasPackageManager) {
                packageManager = await promptChoice(
                    rl,
                    "Package manager",
                    VALID_PACKAGE_MANAGERS,
                    "npm"
                );
            }
            if (!hasSkipInstall) {
                skipInstall = await promptYesNo(rl, "Skip install?", false);
            }
            if (!hasGit) {
                initGit = await promptYesNo(rl, "Init git?", false);
            }
        } finally {
            rl.close();
        }
    }

    if (!name) die("Please provide a package name");
    if (!VALID_PRESETS.includes(preset)) die(`Invalid preset: ${preset}`);
    if (!VALID_PACKAGE_MANAGERS.includes(packageManager)) {
        die(`Invalid package manager: ${packageManager}`);
    }

    const targetDir = path.join(process.cwd(), name);
    if (await fs.pathExists(targetDir)) die("A directory already exists");

    await fs.mkdirp(targetDir);

    const templateDir = getTemplateDir(preset);
    if (!await fs.pathExists(templateDir)) die(`Template not found for preset: ${preset}`);
    await fs.copy(templateDir, targetDir);
    await patchTsConfig(targetDir, isESM, preset);

    const enableEslint = useEslint || usePrettier;
    const enablePrettier = usePrettier;

    if (enableEslint) {
        await copyEslintConfig(targetDir, preset, enablePrettier);
    }
    if (enablePrettier) {
        await copyPrettierConfig(targetDir);
    }

    await run("npm", ["init", "-y"], targetDir);

    if (!skipInstall) {
        await installDependencies(
            packageManager,
            ["typescript", "ts-node", "@types/node"],
            true,
            targetDir
        );

        if (enableEslint) {
            await installDependencies(
                packageManager,
                ["eslint", "@typescript-eslint/parser", "@typescript-eslint/eslint-plugin"],
                true,
                targetDir
            );
        }

        if (enablePrettier) {
            await installDependencies(
                packageManager,
                ["prettier", "eslint-config-prettier"],
                true,
                targetDir
            );
        }

        const frameworkDeps = getFrameworkDependencies(preset);
        await installDependencies(packageManager, frameworkDeps, false, targetDir);
    }

    const pkgPath = path.join(targetDir, "package.json");
    const pkg = await fs.readJson(pkgPath);

    pkg.scripts = pkg.scripts || {};
    if (isESM) {
        pkg.type = "module";
    }

    switch (preset) {
        case "base":
            pkg.scripts.build = "tsc";
            pkg.scripts.dev = "tsx watch src/index.ts";
            break;

        case "library":
            pkg.main = "dist/index.js";
            pkg.types = "dist/index.d.ts";
            pkg.scripts.build = "tsc";
            break;

        case "backend":
            pkg.scripts.build = "tsc";
            pkg.scripts.dev = "tsx watch src/index.ts";
            pkg.scripts.start = "node dist/index.js";
            break;

        case "cli":
            pkg.bin = {
                ...(pkg.bin || {}),
                [name]: "dist/index.js"
            };
            pkg.scripts.build = "tsc";
            break;

        case "monorepo":
            pkg.private = true;
            pkg.workspaces = ["packages/*"];
            pkg.scripts.build = "tsc -b";
            pkg.scripts.dev = "tsx watch packages/app/src/index.ts";
            await patchMonorepoAppPackage(targetDir, name, isESM);
            break;

        case "nestjs":
            pkg.scripts.build = "tsc";
            pkg.scripts.dev = "tsx watch src/main.ts";
            pkg.scripts.start = "node dist/main.js";
            break;

        case "moleculer":
            pkg.scripts.build = "tsc";
            pkg.scripts.dev = "tsx watch src/index.ts";
            pkg.scripts.start = "node dist/index.js";
            break;
    }

    if (enableEslint) {
        pkg.scripts.lint = "eslint .";
    }

    if (enablePrettier) {
        pkg.scripts.format = "prettier --write .";
    }

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });

    if (initGit) {
        await run("git", ["init"], targetDir);
    }

    console.log("\n✅ Done!");
    console.log(`👉 cd ${name}`);
    console.log("👉 npm run build");
}

main().catch((e) => die(e?.message || String(e)));
