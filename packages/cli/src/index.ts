#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';
import { sync } from './commands/sync.js';

const program = new Command();

program
  .name('ai-design-rules')
  .description('Install AI-executable design rules for your UI component library')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize AI design rules in the current project')
  .action(init);

program
  .command('sync')
  .description('Sync custom antd theme tokens into installed rule files')
  .action(sync);

program.parse();
