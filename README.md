# ts-package-init

A fast, minimal, and modern TypeScript project initializer.

Create a TypeScript project with sensible defaults in seconds — no frameworks, no boilerplate overload.

---

## ✨ Features

- Zero-config TypeScript setup
- Presets: `base`, `library`, `backend`, `cli`, `monorepo`, `nestjs`, `moleculer`
- CommonJS or ESM (`--esm`)
- Optional ESLint & Prettier
- Optional interactive mode (`--interactive`)
- Package manager selection (`--package-manager`)
- Uses `tsx` for fast dev experience
- Works with Node.js 18+

---

## 🚀 Usage

### Quick start

```bash
npx ts-package-init my-app
cd my-app
npm run dev
```

### Using npm init

```bash
npm init ts-package my-app
```

---

## Expected output (file tree)

> Minimal structure shown. Additional files are added based on flags.

### Base (default)
```text
my-app/
  package.json
  tsconfig.json
  src/
    index.ts
```

### Library
```text
my-lib/
  package.json
  tsconfig.json
  src/
    index.ts
```

### Backend
```text
api/
  package.json
  tsconfig.json
  src/
    index.ts
```

### CLI
```text
my-cli/
  package.json
  tsconfig.json
  src/
    index.ts
```

### Monorepo
```text
my-workspace/
  package.json
  tsconfig.json
  packages/
    app/
      package.json
      tsconfig.json
      src/
        index.ts
```

### NestJS
```text
my-nest/
  package.json
  tsconfig.json
  src/
    index.ts
    app.module.ts
```

### Moleculer
```text
my-broker/
  package.json
  tsconfig.json
  src/
    index.ts
```

**Optional files and changes**
- `--eslint`: adds `eslint.config.js`.
- `--prettier`: adds `eslint.config.js` (with Prettier) and `.prettierrc.json`.
- `--git`: adds `.git/`.
- `--esm`: updates `package.json` and `tsconfig.json` (no new files).
- `--skip-install` / `--package-manager`: no file tree changes.

---

## 📦 Presets

### Base (default)

Minimal runnable TypeScript project.

```bash
npx ts-package-init my-app
```

Scripts:
```json
{
  "build": "tsc",
  "dev": "tsx watch src/index.ts"
}
```

---

### Library

For reusable npm packages.

```bash
npx ts-package-init my-lib --preset library
```

Includes:
- type declarations
- clean build output

---

### Backend

For APIs, workers, and services.

```bash
npx ts-package-init api --preset backend
```

Includes:
- `dev`, `build`, `start` scripts
- long-running process defaults

---

### CLI

For command-line tools.

```bash
npx ts-package-init my-cli --preset cli
```

Includes:
- executable binary
- Node shebang support

---

### Monorepo

For npm workspaces with a minimal app package.

```bash
npx ts-package-init my-workspace --preset monorepo
```

Includes:
- root workspaces config
- `packages/app` with build/dev scripts

---

### NestJS

Minimal NestJS app scaffold.

```bash
npx ts-package-init my-nest --preset nestjs
```

Includes:
- NestJS bootstrap
- build/dev/start scripts

---

### Moleculer

Minimal Moleculer broker scaffold.

```bash
npx ts-package-init my-broker --preset moleculer
```

Includes:
- Moleculer broker bootstrap
- build/dev/start scripts

---

## 📘 ESM Support

Enable ESM with:

```bash
npx ts-package-init my-app --esm
```

This will:
- set `"type": "module"`
- adjust TypeScript config automatically

---

## 🧹 ESLint & Prettier (optional)

```bash
npx ts-package-init my-app --eslint
npx ts-package-init my-app --prettier
```

Prettier automatically enables ESLint integration.

---

## ⚙️ Additional flags

```bash
npx ts-package-init my-app --interactive
npx ts-package-init my-app --skip-install
npx ts-package-init my-app --package-manager pnpm
npx ts-package-init my-app --git
```

---

## 🧪 Examples

```bash
npx ts-package-init demo
npx ts-package-init my-lib --preset library --esm
npx ts-package-init api --preset backend --eslint --prettier
npx ts-package-init tool --preset cli
npx ts-package-init my-workspace --preset monorepo --skip-install
npx ts-package-init my-nest --preset nestjs --package-manager pnpm
npx ts-package-init my-broker --preset moleculer --interactive
```

---

## 🛣 Roadmap

- Preset-aware ESLint rules
- Interactive mode
- Monorepo preset
- Framework presets (NestJS, Moleculer)

---

## 📄 License

MIT

---

## Support

If this package helps you, please consider supporting it:

⭐ Star the repository  
☕ Support the project: https://buymeacoffee.com/mostafahanafy

