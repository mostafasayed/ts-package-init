# create-ts-package

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
npx create-ts-package my-app
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
npx create-ts-package my-app
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
npx create-ts-package my-lib --preset library
```

Includes:
- type declarations
- clean build output

---

### Backend

For APIs, workers, and services.

```bash
npx create-ts-package api --preset backend
```

Includes:
- `dev`, `build`, `start` scripts
- long-running process defaults

---

### CLI

For command-line tools.

```bash
npx create-ts-package my-cli --preset cli
```

Includes:
- executable binary
- Node shebang support

---

## 📘 ESM Support

Enable ESM with:

```bash
npx create-ts-package my-app --esm
```

This will:
- set `"type": "module"`
- adjust TypeScript config automatically

---

## 🧹 ESLint & Prettier (optional)

```bash
npx create-ts-package my-app --eslint
npx create-ts-package my-app --prettier
```

Prettier automatically enables ESLint integration.

---

## 🧪 Examples

```bash
npx create-ts-package demo
npx create-ts-package my-lib --preset library --esm
npx create-ts-package api --preset backend --eslint --prettier
npx create-ts-package tool --preset cli
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
