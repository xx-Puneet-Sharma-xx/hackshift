# Next.js AI Agents Project

A modern web application built using **Next.js**, **TypeScript**, and **Tailwind CSS**, featuring configured AI agent architectures.

## 🚀 Getting Started

Because the heavy system files (`node_modules` and `.next`) are excluded from this repository to keep it lightweight, you need to initialize them locally before running the application.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your computer.

### Installation

1. Clone or download this repository to your local machine.
2. Open your terminal or command prompt inside the project folder.
3. Install all required dependencies by running:
   ```bash
   npm install
   ```

### Running the Development Server

Once the installation finishes, start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to see the live application.

---

## 📁 Repository Structure Overview

Here is a breakdown of the core files and configurations uploaded to this repository:

*   **`src/`** - The main codebase containing application components, pages, logic, and styles.
*   **`data/`** - Local data stores, configurations, or static mock files utilized by the application.
*   **`public/`** - Static assets such as images, icons, and fonts served directly to the browser.
*   **`AGENTS.md`** - Documentation detailing the configurations, prompts, and architecture of the AI agents.
*   **`package.json` & `package-lock.json`** - Manages project manifests, operational scripts, and exact versions of third-party dependencies.
*   **`next.config.ts`** - Custom configuration settings for the Next.js framework runtime.
*   **`tsconfig.json`** - TypeScript configuration layout defining compiler options and path aliases.
*   **`eslint.config.mjs`** - Code linting rules ensuring consistent code quality and formatting.
*   **`.gitignore`** - Instructs Git to ignore transient directories like local environment variables, caches, and dependency folders.

---

## 🛠️ Build and Production

To compile a production-ready optimized build of the application, execute:

```bash
npm run build
```

To run the production server locally after building:

```bash
npm run start
```
