# ai-memory-engine

Configuring MCP server in opencode:
1) Building the project:
```bash
npm run build
```

2) Making executable:
```bash
chmod +x dist/cli.js
```

3) Running the server:
```bash
npx ai-memory-engine
```

4) Adding MCP server to opencode config:
```json
{
  "mcp": {
    "memory-engine": {
      "type": "local",
      "command": ["npx", "-y", "ai-memory-engine"],
      "enabled": true
    }
  }
}
```
