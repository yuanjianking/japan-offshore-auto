/**
 * 代码维护流水线常量定义
 */

/**
 * 错误代码
 */
export const ERROR_CODES = {
  // 文件系统错误
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  DIRECTORY_NOT_FOUND: 'DIRECTORY_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // 分析错误
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  INVALID_ANALYSIS_REPORT: 'INVALID_ANALYSIS_REPORT',

  // 修改错误
  MODIFICATION_FAILED: 'MODIFICATION_FAILED',
  BACKUP_FAILED: 'BACKUP_FAILED',
  CODE_REPLACEMENT_FAILED: 'CODE_REPLACEMENT_FAILED',

  // 验证错误
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  STATIC_ANALYSIS_FAILED: 'STATIC_ANALYSIS_FAILED',
  TESTS_FAILED: 'TESTS_FAILED',

  // Claude SDK错误
  CLAUDE_QUERY_FAILED: 'CLAUDE_QUERY_FAILED',
  INVALID_CLAUDE_RESPONSE: 'INVALID_CLAUDE_RESPONSE',

  // 流水线错误
  PIPELINE_EXECUTION_FAILED: 'PIPELINE_EXECUTION_FAILED',
  INVALID_CONTEXT: 'INVALID_CONTEXT',
} as const;


export const PLANNER_PROMPT_TEMPLATE = `

# 任务：制定项目实施计划

## 用户需求描述

{{taskRequirement}}

## 目标代码输出目录

{{codeDirectory}}

## 需求文档

{{docDirectory}}

## 指令

请根据上述用户需求描述和需求文档，按照系统提示词的要求，输出一份完整的项目实施计划。


### 分析步骤

1. **理解需求**：先理解用户描述的核心意图
2. **提取文档**：从文档中提取所有功能需求、约束条件、技术规格
3. **识别优先级**：区分必须实现（高）、应该实现（中）、可选实现（低）
4. **标注不确定性**：如果需求描述不清晰或文档存在矛盾，在"需求澄清项"中标出
5. **设计任务**：将需求拆解为可独立执行的任务
6. **定义依赖**：明确任务之间的前后置关系
7. **规划输出**：确定每个任务的产出物和存放路径

### 特别注意

- 如果文档内容与用户描述不一致，**优先采用文档中的定义**，并在"需求澄清项"中标注差异
- 如果文档中缺少必要信息（如数据库连接方式、第三方API密钥等），在"需求不确定性"中列出
- 如果需求过于简单（少于3个任务），请适当细化
- 如果需求过于复杂（超过20个任务），请适当合并，保持合理粒度
- 不要扫描{{docDirectory}}，{{codeDirectory}}以外的文件夹。
- **重要**：你必须主动扫描文档目录 {{docDirectory}} 并读取其中的.md和.mdx文件，以获取文档内容。使用Glob和Read工具。

### 输出格式

直接输出 Markdown 格式的计划报告，不要有任何额外内容（如"好的"、"以下是计划"等开场白）。

计划报告将保存到：\`{{codeDirectory}}/PROJECT_PLAN.md\`

现在请输出计划报告：

`;
export const CODER_PROMPT_TEMPLATE = `

# 任务：生成代码

## 用户需求描述

{{taskRequirement}}

## 目标代码输出目录

{{codeDirectory}}

## 需求文档

{{docDirectory}}

## 实施计划

你需要先使用Read工具读取 \`{{codeDirectory}}/PROJECT_PLAN.md\` 文件获取实施计划：

## 指令

请根据上述实施计划和当前任务描述，生成符合要求的代码。

### 生成步骤

1. **理解任务**：仔细阅读当前任务的描述和验收标准
2. **参考依赖**：查看前置任务的输出，确保接口和数据模型一致
3. **遵循规范**：按照系统提示词中的代码规范生成代码
4. **完整输出**：确保代码完整、可运行、无语法错误

### 特别注意

- 如果当前任务依赖前置任务，必须保持接口兼容
- 如果任务涉及数据库操作，使用参数化查询防止 SQL 注入
- 如果任务涉及敏感信息，使用环境变量，不要硬编码
- 如果任务涉及错误处理，必须完整覆盖异常情况
- 如果任务是测试代码，必须包含正常、边界、异常三种测试用例

### 输出格式

**只输出纯代码内容，不要有任何额外内容。**

- ❌ 不要输出 "好的，这是代码：" 这类开场白
- ❌ 不要输出 \`\`\` 代码块标记
- ❌ 不要输出 Markdown 格式
- ❌ 不要输出代码解释或说明
- ✅ 直接输出代码内容

例如，如果输出路径是 \`src/controllers/authController.ts\`，输出应该直接是 TypeScript 代码：

\`\`\`
import { Request, Response } from 'express';
// ... 代码内容
export class AuthController {
    // ...
}
\`\`\`

（注意：上面的 \`\`\` 仅用于示例说明，实际输出时不要包含）

### 输出确认

生成代码后，请确认：
- [ ] 代码语法正确
- [ ] 所有导入都已声明
- [ ] 错误处理完整
- [ ] 符合验收标准
- [ ] 与依赖任务输出一致

### 特别注意
- **重要**：你必须使用Read工具读取 \`{{codeDirectory}}/PROJECT_PLAN.md\` 文件，使用Glob和Read工具读取依赖任务的输出文件
- 不要扫描{{docDirectory}}，{{codeDirectory}}以外的文件夹。

现在请输出代码：

`;
export const WRITER_PROMPT_TEMPLATE = `

# 任务：生成技术文档

## 用户需求描述

{{taskRequirement}}

## 目标代码输出目录

{{codeDirectory}}

## 需求文档

{{docDirectory}}


## 实施计划

你需要先使用Read工具读取 \`{{codeDirectory}}/PROJECT_PLAN.md\` 文件获取实施计划：

## 指令

请根据上述实施计划、已生成的代码和当前文档任务，生成符合要求的文档。

### 生成步骤

1. **理解文档类型**：根据文档类型（API文档/数据库文档/架构文档/用户手册/部署文档/README）确定输出格式
2. **提取信息**：从已生成的代码中提取必要信息（接口定义、表结构、配置项等）
3. **组织内容**：按照标准格式组织文档内容
4. **补充说明**：添加必要的使用说明和示例

### 特别注意

- **API文档**：必须从代码中提取实际的接口定义（URL、参数、返回值）
- **数据库文档**：必须从 SQL 文件中提取实际的表结构和关系
- **架构文档**：必须基于代码结构和计划报告中的技术方案
- **用户手册**：必须面向最终用户，语言通俗易懂
- **部署文档**：必须包含可执行的命令和配置说明
- **README**：必须包含项目简介、快速开始、项目结构

### 文档一致性检查

生成文档后，请确认：
- [ ] 文档中的接口与代码中的路由定义一致
- [ ] 文档中的参数与代码中的参数验证一致
- [ ] 文档中的响应格式与代码中的返回格式一致
- [ ] 文档中的表结构与代码中的 SQL 一致
- [ ] 文档中的配置项与代码中的环境变量一致

### 输出格式

**只输出文档内容，不要有任何额外内容。**

- ❌ 不要输出 "好的，这是文档：" 这类开场白
- ❌ 不要输出文档之外的解释或说明
- ✅ 直接输出文档内容（Markdown 或 YAML）

例如，如果输出路径是 \`docs/API.md\`，输出应该直接是 Markdown 格式的 API 文档：

\`\`\`markdown
# API 文档

## 用户注册

### 请求
- URL: POST /api/register
...
\`\`\`

（注意：上面的 \`\`\` 仅用于示例说明，实际输出时根据文档类型决定是否包含）

### 特别注意
- **重要**：你必须使用Read工具读取 \`{{codeDirectory}}/PROJECT_PLAN.md\` 文件，使用Glob和Read工具扫描输出目录读取已生成的代码文件
- 不要扫描{{docDirectory}}，{{codeDirectory}}以外的文件夹。

现在请输出文档：

`;

export const REVIEWER_PROMPT_TEMPLATE = `

# 任务：审查生成的代码和文档


## 用户需求描述

{{taskRequirement}}

## 目标代码输出目录

{{codeDirectory}}

## 需求文档

{{docDirectory}}

## 实施计划

你需要先使用Read工具读取 \`{{codeDirectory}}/PROJECT_PLAN.md\` 文件获取实施计划：

## 指令

请根据上述实施计划、生成的代码和文档，按照系统提示词的要求，输出一份完整的审查报告。

### 审查步骤

1. **语法检查**：检查所有代码文件是否有语法错误
2. **逻辑检查**：检查代码逻辑是否正确，是否满足需求
3. **安全检查**：检查是否存在安全漏洞（SQL注入、XSS、硬编码敏感信息等）
4. **规范检查**：检查代码是否符合规范（命名、结构、注释）
5. **完整性检查**：检查文档是否完整
6. **准确性检查**：检查文档是否与代码一致
7. **计划符合度**：检查是否按计划完成所有任务
8. **可运行性验证**：检查依赖、配置、启动命令等

### 特别注意

- **必须区分严重程度**：错误 > 警告 > 建议
- **必须给出具体位置**：文件名 + 行号（如可能）
- **必须给出修复建议**：每个问题都要有修复方案
- **必须标记自动可修复**：哪些问题可以自动修复
- **必须给出明确结论**：通过 / 有条件通过 / 不通过

### 输出格式

直接输出 Markdown 格式的审查报告，不要有任何额外内容（如"好的"、"以下是报告"等开场白）。

审查报告将保存到：\`{{codeDirectory}}/REVIEW_REPORT.md\`


### 特别注意
- **重要**：你必须使用Read工具读取 \`{{codeDirectory}}/PROJECT_PLAN.md\` 文件，使用Glob和Read工具扫描输出目录读取代码和文档文件
- 不要扫描{{docDirectory}}，{{codeDirectory}}以外的文件夹。

现在请输出审查报告：

`;
