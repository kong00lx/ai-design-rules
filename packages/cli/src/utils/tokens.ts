import fs from 'fs-extra';
import path from 'path';

export interface TokenOverrides {
  colorPrimary?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorError?: string;
  borderRadius?: string;
}

/** antd v5 默认值 — 与 rules 文件中硬编码的值保持一致 */
export const ANTD_DEFAULTS: Required<TokenOverrides> = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  borderRadius: '6',
};

/** 常见的主题配置文件路径（按优先级排序） */
const THEME_SEARCH_PATHS = [
  'src/theme.ts',
  'src/theme.tsx',
  'src/config/theme.ts',
  'src/config/theme.tsx',
  'src/styles/theme.ts',
  'theme.ts',
  'theme.tsx',
  'src/App.tsx',
  'src/app/providers.tsx',
  'app/providers.tsx',
  'app/layout.tsx',
  'src/main.tsx',
  'src/index.tsx',
];

const TOKEN_PATTERNS: Record<keyof TokenOverrides, RegExp> = {
  colorPrimary: /colorPrimary\s*[:=]\s*['"]?(#[0-9a-fA-F]{3,8})/,
  colorSuccess: /colorSuccess\s*[:=]\s*['"]?(#[0-9a-fA-F]{3,8})/,
  colorWarning: /colorWarning\s*[:=]\s*['"]?(#[0-9a-fA-F]{3,8})/,
  colorError: /colorError\s*[:=]\s*['"]?(#[0-9a-fA-F]{3,8})/,
  borderRadius: /borderRadius\s*[:=]\s*['"]?(\d+)/,
};

/** 扫描项目源码，提取 antd token 覆盖值 */
export function detectTokensFromSource(projectRoot: string): TokenOverrides {
  const tokens: TokenOverrides = {};

  for (const relPath of THEME_SEARCH_PATHS) {
    const fullPath = path.join(projectRoot, relPath);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');

    for (const [key, pattern] of Object.entries(TOKEN_PATTERNS) as [keyof TokenOverrides, RegExp][]) {
      if (tokens[key]) continue;
      const match = content.match(pattern);
      if (match) tokens[key] = match[1];
    }

    if (Object.keys(tokens).length > 0) break;
  }

  return tokens;
}

/** 将 token 覆盖值应用到已安装的规则文件 */
export function applyTokensToRules(rulesDir: string, overrides: TokenOverrides): number {
  if (!fs.existsSync(rulesDir)) return 0;

  const ruleFiles = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.mdc'));
  let updatedCount = 0;

  for (const file of ruleFiles) {
    const filePath = path.join(rulesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    for (const [token, newValue] of Object.entries(overrides) as [keyof TokenOverrides, string][]) {
      const defaultValue = ANTD_DEFAULTS[token];
      if (!defaultValue || newValue === defaultValue) continue;
      const updated = content.replaceAll(defaultValue, newValue);
      if (updated !== content) {
        content = updated;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      updatedCount++;
    }
  }

  return updatedCount;
}

/** 读取已保存的配置文件 */
export function readConfig(projectRoot: string): TokenOverrides {
  const configPath = path.join(projectRoot, 'ai-design-rules.config.json');
  if (!fs.existsSync(configPath)) return {};
  try {
    return fs.readJsonSync(configPath)?.tokens ?? {};
  } catch {
    return {};
  }
}

/** 保存配置文件 */
export function saveConfig(projectRoot: string, library: string, preset: string, tokens: TokenOverrides): void {
  const configPath = path.join(projectRoot, 'ai-design-rules.config.json');
  fs.writeJsonSync(
    configPath,
    { library, preset, tokens },
    { spaces: 2 },
  );
}
