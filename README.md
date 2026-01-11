# ts-package-init

A fast, minimal, and modern TypeScript project initializer.

Create a TypeScript project with sensible defaults in seconds — no frameworks, no boilerplate overload.

---

## ✨ Features

- Zero-config TypeScript setup
- Presets: `base`, `library`, `backend`, `cli`
- CommonJS or ESM (`--esm`)
- Optional ESLint & Prettier
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

## 🧪 Examples

```bash
npx ts-package-init demo
npx ts-package-init my-lib --preset library --esm
npx ts-package-init api --preset backend --eslint --prettier
npx ts-package-init tool --preset cli
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
