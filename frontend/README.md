# RGB++ Explorer Frontend

## Component Library

This project uses **Park UI** and **Pandacss** as the component library, providing a set of reusable UI components that enhance the overall user experience.

## Multilingual Solution

For handling multilingual support, we use **Lingui**. This library allows for efficient extraction, compilation, and management of translations in the application.

## Minimum Version Requirements

To run this project, ensure you have the following minimum versions installed:

- **Node.js**: 20.x or higher
- **pnpm**: v9.4 or higher

### Package Manager

This project uses `pnpm` as the package manager. Ensure you have `pnpm` installed. If not, you can install it globally with:

```bash
npm install -g pnpm
```

### Installation
```bash
pnpm install
```

### Startup Instructions
To start the development server, run:
```bash
pnpm dev
```
This command will start the Next.js application in development mode. You can access the application at [`http://localhost:3000`](http://localhost:3000).

### Build
To create a production build, run:
```bash
pnpm build
```

After building, you can start the production server with:

```bash
pnpm start
```
### Linting and Code Formatting
To lint your code, use:
```bash
pnpm lint
```

To check for spelling errors, run:
```bash
pnpm cspell
```

To extract and compile translations, use:
```bash
pnpm lingui
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.