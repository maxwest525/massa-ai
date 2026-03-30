'use strict';

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const z = require('zod/v4');

async function main() {
  const mcpServer = new McpServer(
    { name: 'masa-mcp-minimal', version: '1.0.0' },
    {
      instructions:
        'Minimal Model Context Protocol server for MASA. Exposes example tools; add registerTool / registerResource / registerPrompt as needed.',
    }
  );

  mcpServer.registerTool(
    'ping',
    { description: 'Returns pong. Verifies the server is reachable.' },
    async () => ({
      content: [{ type: 'text', text: 'pong' }],
    })
  );

  mcpServer.registerTool(
    'echo',
    {
      description: 'Echoes input text.',
      inputSchema: { message: z.string().describe('Text to echo') },
    },
    async ({ message }) => ({
      content: [{ type: 'text', text: message }],
    })
  );

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
