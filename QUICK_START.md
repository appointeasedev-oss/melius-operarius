# Quick Start Guide - Melius Operarius

## Installation

### Method 1: Global Installation (Recommended)
```bash
# Install globally
npm install -g melius-operarius

# Run the one-command installer
install-melius
```

### Method 2: Run Without Installing
```bash
# Run directly without installation
npx melius-operarius setup-wizard
```

## Post-Installation Setup

After installation, you can use these commands:

### Start the Service
```bash
melius-operarius start
```

### Interactive Chat
```bash
melius-operarius chat
```

### View Available Models
```bash
melius-operarius models
```

### Web Interface
Once the service is running, visit: http://localhost:3000/web

## First-Time Usage

1. **Install and setup** using one of the methods above
2. **Start the service**: `melius-operarius start`
3. **Open your browser** to http://localhost:3000/web for the web interface, or
4. **Use the CLI**: `melius-operarius chat` for interactive chat

## Command Reference

| Command | Description |
|---------|-------------|
| `melius-operarius start` | Start the Melius Operarius service |
| `melius-operarius setup` | Basic setup configuration |
| `melius-operarius setup-wizard` | Interactive setup assistant |
| `melius-operarius chat` | Start interactive chat session |
| `melius-operarius models` | List available models |
| `melius-operarius migrate-from-openclaw` | Migrate from OpenClaw if previously installed |

## Web Interface

The web interface provides a graphical way to interact with Melius Operarius:
- Visit http://localhost:3000/web
- Real-time system status monitoring
- Interactive chat interface
- Model and plugin management
- Configuration controls

## Troubleshooting

### Common Issues

1. **"Command not found" after global installation**
   - Make sure npm global binaries are in your PATH
   - Try running: `npx melius-operarius` instead

2. **Ollama not found**
   - Ensure Ollama is installed from https://ollama.ai
   - Make sure the Ollama service is running

3. **Port already in use**
   - Change the port with: `melius-operarius setup-wizard`
   - Or modify the config file directly

### Need Help?

- Check the full documentation in the main README
- Visit our GitHub repository for issues and support
- Join our community for assistance

---

That's it! You're now ready to use Melius Operarius, the privacy-first AI agent that runs entirely on your local machine.