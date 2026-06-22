#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';

const program = new Command();

program
  .name('ai-design-rules')
  .description('Install AI-executable design rules for your UI component library')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize AI design rules in the current project')
  .action(init);

program.parse();
