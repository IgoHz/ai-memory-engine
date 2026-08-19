import { MCPServer } from './MCPServer.js';
import { MCPToolRegistry } from './MCPToolRegistry.js';
import { createApplication } from '../app/compositionRoot.js';

export function createMcpServer(): MCPServer {
	const application = createApplication();
	const tools = new MCPToolRegistry(
		application.search,
		application.writer,
		application.projectRegistry,
		application.indexer,
		application.archiver,
		application.summarizer,
		application.relationships,
		application.duplicates
	);

	return new MCPServer(tools);
}

export * from './MCPServer.js';
