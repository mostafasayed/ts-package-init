#!/usr/bin/env node
import path from "node:path";
import fs from "fs-extra";
import minimist from "minimist";
import { execa } from "execa";
import { fileURLToPath } from "node:url";

type Options = {
    yes?: boolean;
    preset?: string;
}

type Preset = "base" | "cli" | "library" | "backend";
const VALID_PRESETS: Preset[] = ["base", "cli", "library", "backend"];

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

async function patchTsConfig(targetDir: string, isESM: boolean) {
    const tsConfigPath = path.join(targetDir, "tsconfig.json");
    const tsconfig = await fs.readJson(tsConfigPath);

    if (isESM) {
        tsconfig.compilerOptions.module = "ES2022";
        tsconfig.compilerOptions.moduleResolution = "Bundler";
    }

    await fs.writeJson(tsConfigPath, tsconfig, { spaces: 2 });
}

function getEslintTemplate(withPrettier: boolean) {
    return withPrettier
        ? "eslint.prettier.config.js"
        : "eslint.config.js";
}

async function copyEslintConfig(targetDir: string, withPrettier: boolean) {
    const filename = getEslintTemplate(withPrettier);

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

async function main() {
    const args = minimist(process.argv.slice(2), {
        default: {
            preset: "base",
            esm: false,
            eslint: false,
            prettier: false
        },
    });
    const name = args._[0] as string | undefined;
    const preset = args.preset as Preset;
    const isESM = Boolean(args.esm);
    const useEslint = Boolean(args.eslint);
    const usePrettier = Boolean(args.prettier);
    const enableEslint = useEslint || usePrettier;
    const enablePrettier = usePrettier;
    const options: Options = {
        yes: args.yes as boolean | undefined,
    };

    if (!name) die("Please provide a package name");
    // Check valid preset
    if (!VALID_PRESETS.includes(preset)) die(`Invalid preset: ${preset}`);

    const targetDir = path.join(process.cwd(), name);
    if (await fs.pathExists(targetDir)) die("A directory already exists");

    // 1) create directory
    await fs.mkdirp(targetDir);

    // 2) copy base template
    const templateDir = getTemplateDir(preset);
    if (!await fs.pathExists(templateDir)) die(`Template not found for preset: ${preset}`);
    await fs.copy(templateDir, targetDir);
    await patchTsConfig(targetDir, isESM);
    if (enableEslint) {
        await copyEslintConfig(targetDir, enablePrettier);
    }
    if (enablePrettier) {
        await copyPrettierConfig(targetDir);
    }

    // 3) npm init -y
    await run("npm", ["init", "-y"], targetDir);

    // 4) install deps
    await run("npm", ["i", "-D", "typescript", "ts-node", "@types/node"], targetDir);
    if (enableEslint) {
        await run("npm", [
            "i",
            "-D",
            "eslint",
            "@typescript-eslint/parser",
            "@typescript-eslint/eslint-plugin"
        ], targetDir);
    }

    if (enablePrettier) {
        await run("npm", [
            "i",
            "-D",
            "prettier",
            "eslint-config-prettier"
        ], targetDir);
    }

    // 5) patch package.json
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
    }

    if (enableEslint) {
        pkg.scripts.lint = "eslint .";
    }

    if (enablePrettier) {
        pkg.scripts.format = "prettier --write .";
    }

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });

    console.log("\n✅ Done!");
    console.log(`👉 cd ${name}`);
    console.log("👉 npm run build");
}

main().catch((e) => die(e?.message || String(e)));
