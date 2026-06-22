import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { input, confirm } from '@inquirer/prompts';
import {
  detectTokensFromSource,
  applyTokensToRules,
  readConfig,
  saveConfig,
  ANTD_DEFAULTS,
  type TokenOverrides,
} from '../utils/tokens.js';

export async function sync(): Promise<void> {
  console.log(chalk.bold('\n  ai-design-rules sync\n'));

  const projectRoot = process.cwd();
  const rulesDir = path.join(projectRoot, '.cursor', 'rules');

  if (!fs.existsSync(rulesDir)) {
    console.log(chalk.red('❌  未找到 .cursor/rules/，请先执行 ai-design-rules init'));
    process.exit(1);
  }

  // 读取已有配置
  const savedConfig = readConfig(projectRoot);
  const library = savedConfig.library ?? 'antd';

  // 自动检测项目 token
  console.log(chalk.gray('  正在扫描项目 theme 配置...'));
  const detected = detectTokensFromSource(projectRoot);

  // 合并：已保存的配置 < 自动检测值
  const merged: TokenOverrides = { ...savedConfig, ...detected };

  // 展示当前 token 状态
  const tokenKeys = Object.keys(ANTD_DEFAULTS) as (keyof TokenOverrides)[];
  console.log(chalk.gray('\n  当前 Token 状态（antd 默认 → 你的项目值）：\n'));

  for (const key of tokenKeys) {
    const defaultVal = ANTD_DEFAULTS[key];
    const currentVal = merged[key];
    if (currentVal && currentVal !== defaultVal) {
      console.log(`  ${chalk.cyan(key.padEnd(18))} ${chalk.gray(defaultVal)} → ${chalk.green(currentVal)}`);
    } else {
      console.log(`  ${chalk.gray(key.padEnd(18))} ${chalk.gray(defaultVal)} （使用默认值）`);
    }
  }

  // 询问是否手动补充
  console.log();
  const wantManual = await confirm({
    message: '是否手动补充或修改 token 值？',
    default: false,
  });

  if (wantManual) {
    for (const key of tokenKeys) {
      const current = merged[key] ?? ANTD_DEFAULTS[key];
      const val = await input({
        message: `${key}`,
        default: current,
      });
      if (val && val !== ANTD_DEFAULTS[key]) {
        merged[key] = val;
      }
    }
  }

  const overrides: TokenOverrides = {};
  for (const key of tokenKeys) {
    if (merged[key] && merged[key] !== ANTD_DEFAULTS[key]) {
      overrides[key] = merged[key]!;
    }
  }

  if (Object.keys(overrides).length === 0) {
    console.log(chalk.gray('\n  没有需要同步的 token，规则文件保持默认值。'));
    return;
  }

  const spinner = ora('  正在更新规则文件...').start();

  const updatedCount = applyTokensToRules(rulesDir, overrides);
  saveConfig(projectRoot, library, savedConfig.preset ?? 'full', overrides);

  spinner.succeed(chalk.green(`  同步完成`));
  console.log(`
  ${chalk.bold('已更新：')}
  ${chalk.cyan(String(updatedCount))} 个规则文件已替换为你的 token 值
  配置已保存至 ${chalk.gray('ai-design-rules.config.json')}

  ${chalk.bold('下次同步：')}
  ${chalk.gray('修改主题后再次运行 ai-design-rules sync 即可')}
`);
}
