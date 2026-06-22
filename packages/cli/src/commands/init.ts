import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LITE_RULES = [
  '01-design-philosophy.mdc',
  '02-design-principles.mdc',
  '12-component-selection.mdc',
];

function getAssetsDir(library: string): string {
  return path.resolve(__dirname, '..', 'assets', library);
}

function detectLibrary(projectRoot: string): string | null {
  try {
    const pkg = fs.readJsonSync(path.join(projectRoot, 'package.json'));
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    if (deps['antd']) return 'antd';
    if (deps['@shadcn/ui'] || deps['shadcn']) return 'shadcn';
    if (deps['@mui/material']) return 'mui';
    return null;
  } catch {
    return null;
  }
}

function updateAgentsMd(projectRoot: string, library: string, preset: string): void {
  const agentsMdPath = path.join(projectRoot, 'AGENTS.md');
  const section = `
## AI Design Rules (@ai-design-rules/${library})

本项目已安装 AI 设计规则（preset: ${preset}）。

### 可用 Skills
- **interaction-design**：开发新功能前，先输出交互设计简报，用户确认后再编码
- **page-patterns**：生成标准页面骨架（列表页/表单页/详情页/工作台）
- **ui-review**：审查 UI 代码的设计规范合规性

### 规则说明
Rules 文件已安装至 \`.cursor/rules/\`，编辑 \`.tsx\` 文件时自动生效。
`;

  if (fs.existsSync(agentsMdPath)) {
    const content = fs.readFileSync(agentsMdPath, 'utf-8');
    if (!content.includes('@ai-design-rules')) {
      fs.appendFileSync(agentsMdPath, section);
    }
  } else {
    fs.writeFileSync(
      agentsMdPath,
      `# Project Agent Guide\n${section}`,
    );
  }
}

export async function init(): Promise<void> {
  console.log(chalk.bold('\n  ai-design-rules init\n'));

  const projectRoot = process.cwd();

  if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
    console.log(chalk.red('❌  未找到 package.json，请在项目根目录执行'));
    process.exit(1);
  }

  // 自动检测组件库
  const detected = detectLibrary(projectRoot);
  let library: string;

  if (detected === 'antd') {
    console.log(chalk.gray(`  检测到组件库：${chalk.cyan('antd')}\n`));
    library = 'antd';
  } else {
    library = await select({
      message: '选择你的 UI 组件库：',
      choices: [
        { name: 'Ant Design (antd)', value: 'antd' },
        { name: 'shadcn/ui（即将支持）', value: 'shadcn', disabled: '开发中' },
        { name: 'Material UI（即将支持）', value: 'mui', disabled: '开发中' },
      ],
    });
  }

  const preset = await select({
    message: '安装模式：',
    choices: [
      {
        name: `${chalk.green('full')}  完整版 — 12 个规则 + 3 个 Skills（推荐）`,
        value: 'full',
      },
      {
        name: `${chalk.yellow('lite')}  精简版 — 3 个核心规则 + 3 个 Skills（节省 context）`,
        value: 'lite',
      },
    ],
  });

  const rulesDir = path.join(projectRoot, '.cursor', 'rules');
  const skillsDir = path.join(projectRoot, '.agents', 'skills');

  console.log(chalk.gray('\n  安装路径：'));
  console.log(chalk.gray(`    Rules  → ${rulesDir}`));
  console.log(chalk.gray(`    Skills → ${skillsDir}`));
  console.log();

  const ok = await confirm({ message: '确认安装？', default: true });
  if (!ok) {
    console.log(chalk.gray('  已取消'));
    process.exit(0);
  }

  const spinner = ora('  安装中...').start();

  try {
    const assetsDir = getAssetsDir(library);
    const srcRules = path.join(assetsDir, 'rules');
    const srcSkills = path.join(assetsDir, 'skills');

    fs.ensureDirSync(rulesDir);
    fs.ensureDirSync(skillsDir);

    // 复制 rules
    const ruleFiles = fs.readdirSync(srcRules).filter((f) => f.endsWith('.mdc'));
    let copiedRules = 0;
    for (const file of ruleFiles) {
      if (preset === 'lite' && !LITE_RULES.includes(file)) continue;
      fs.copySync(path.join(srcRules, file), path.join(rulesDir, file), { overwrite: true });
      copiedRules++;
    }

    // 复制 skills
    fs.copySync(srcSkills, skillsDir, { overwrite: true });
    const skillCount = fs.readdirSync(skillsDir).length;

    // 更新 AGENTS.md
    updateAgentsMd(projectRoot, library, preset);

    spinner.succeed(chalk.green(`  安装完成`));

    console.log(`
  ${chalk.bold('已安装：')}
  ${chalk.cyan(`${copiedRules}`)} 个 Rules  → ${chalk.gray('.cursor/rules/')}
  ${chalk.cyan(`${skillCount}`)} 个 Skills → ${chalk.gray('.agents/skills/')}
  ${chalk.cyan('AGENTS.md')} 已更新

  ${chalk.bold('开始使用：')}
  ${chalk.gray('重启 Cursor，然后在对话中输入：')}

  ${chalk.cyan('"帮我设计 [功能名] 的交互方案"')}
  ${chalk.gray('→ 触发交互设计 Skill，先规划后编码')}

  ${chalk.cyan('"生成一个用户列表页"')}
  ${chalk.gray('→ 触发页面模板 Skill')}

  ${chalk.cyan('"review 一下 UserTable.tsx"')}
  ${chalk.gray('→ 触发 UI 审查 Skill')}
`);
  } catch (err) {
    spinner.fail('安装失败');
    console.error(err);
    process.exit(1);
  }
}
