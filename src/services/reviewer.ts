
import { reviewerAgent } from '../agents/reviewer-agent.js';
import { REVIEWER_PROMPT_TEMPLATE, ERROR_CODES } from '../constants/index.js';
import { REVIEWER_SYSTEM_PROMPT_TEMPLATE } from '../system-prompt/reviewer.js';
import { executeClaudeQuery } from '../utils/query-client.js';

export async function reviewer(
  docDirectory: string,
  codeDirectory: string,
  taskRequirement: string
): Promise<void> {
  try {
    console.log(`文档目录: ${docDirectory}`);
    console.log(`代码目录: ${codeDirectory}`);
    console.log(`任务需求: ${taskRequirement}`);

    // 验证文档目录存在
    let directoryExists = await checkDirectoryExists(docDirectory);
    if (!directoryExists) {
      throw new Error(`文档目录不存在: ${docDirectory}`, {
        cause: ERROR_CODES.DIRECTORY_NOT_FOUND,
      });
    }

    // 验证代码目录存在
    directoryExists = await checkDirectoryExists(codeDirectory);
    if (!directoryExists) {
      throw new Error(`代码目录不存在: ${codeDirectory}`, {
        cause: ERROR_CODES.DIRECTORY_NOT_FOUND,
      });
    }

    // 构建Claude审查prompt
    const prompt = buildPrompt(docDirectory, codeDirectory, taskRequirement);

    // 调用Claude进行审查
    console.log('正在使用Claude审查文档...');
    await queryClaude(prompt, docDirectory, codeDirectory, taskRequirement);
    console.log('审查完成');

  } catch (error) {
    console.error('审查失败:', error);
    throw new Error(`审查失败: ${error instanceof Error ? error.message : '未知错误'}`, {
      cause: ERROR_CODES.MODIFICATION_FAILED,
    });
  }
}

/**
 * 检查目录是否存在
 */
async function checkDirectoryExists(directory: string): Promise<boolean> {
  try {
    const { directoryExists } = await import('../utils/common.js');
    return await directoryExists(directory);
  } catch (error) {
    console.warn(`检查目录存在时出错: ${error}`);
    return false;
  }
}

/**
 * 构建prompt
 */
function buildPrompt(
  docDirectory: string,
  codeDirectory: string,
  taskRequirement: string,
): string {
  const prompt = REVIEWER_PROMPT_TEMPLATE
    .replace('{{docDirectory}}', docDirectory)
    .replace('{{codeDirectory}}', codeDirectory)
    .replace('{{taskRequirement}}', taskRequirement);

  return prompt;
}

/**
 * 调用Claude审查
 */
async function queryClaude(prompt: string, docDirectory: string,
  codeDirectory: string,
  taskRequirement: string): Promise<void> {
  try {
    await executeClaudeQuery(prompt, {
      agents: {
        "reviewer": reviewerAgent(docDirectory, codeDirectory, taskRequirement),
      },
      systemPrompt: REVIEWER_SYSTEM_PROMPT_TEMPLATE
    });

  } catch (error) {
    console.error('Claude审查失败:', error);
    throw new Error(`Claude审查失败: ${error instanceof Error ? error.message : '未知错误'}`, {
      cause: ERROR_CODES.CLAUDE_QUERY_FAILED,
    });
  }
}
