# Traffy Integration for Telegram Mini Apps

This project demonstrates how developers can implement Traffy, a task rewards system, within a Telegram Mini App using React and TypeScript.

## Features

- Seamless integration of Traffy task rewards into Telegram Mini Apps
- React-based user interface using Telegram UI components
- Task management system with reward distribution capabilities
- Complete TypeScript support for better developer experience

## Technologies

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Traffy](https://traffy.io/) - Task rewards system
- [@telegram-apps SDK](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/2-x)
- [Telegram UI](https://github.com/Telegram-Mini-Apps/TelegramUI)
- [Vite](https://vitejs.dev/)

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm (package manager)
- A Telegram Bot with Mini App capabilities 

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:
```bash
npm install
```

3. Configure Traffy:
   - The project includes the Traffy script in the `index.html` file
   - Update the `traffy-key` attribute with your own API key from Traffy
   - Set the `test` attribute to `false` for production environments

## Running the Project

### Development Mode

To run the application in development mode with HTTPS support:

```bash
npm run dev:https
```

> Note: The first time you run this command, you may be prompted for your sudo password to set up local SSL certificates.

### Production Build

To create a production-ready build:

```bash
npm run build
```

## Traffy Integration

### Key Components

- `TraffyContainer` - React component that handles the integration with Traffy
- `traffy.ts` - Utility functions for handling Traffy tasks and rewards

### Configuration

Traffy is configured in the `index.html` file:

```html
<script id="traffy-script" src="https://dvq1zz1g273yl.cloudfront.net/index_v1.1.0.min.js"
traffy-key="YOUR_TRAFFY_KEY" test="true"
></script>
```

### Handling Tasks

The integration provides handlers for various Traffy events:

- `onTaskLoad` - Called when tasks are loaded
- `onTaskRender` - Called when a task is rendered
- `onTaskReward` - Called when a task is completed and a reward should be given
- `onTaskReject` - Called when a task is rejected

## Deployment

This project is configured for deployment to GitHub Pages using the `gh-pages` package:

```bash
npm run deploy
```

Make sure to update the `homepage` field in `package.json` and the `base` value in `vite.config.ts` to match your repository name.

## Additional Resources

- [Telegram Mini Apps Documentation](https://docs.telegram-mini-apps.com/)
- [Traffy Documentation](https://traffy.site/docs/docs/) 
- [React Documentation](https://react.dev/)
- [Telegram UI Documentation](https://github.com/Telegram-Mini-Apps/TelegramUI)

## License

This project is licensed under the [MIT License](LICENSE).
