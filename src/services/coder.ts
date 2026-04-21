
import { coderAgent } from '../agents/coder-agent.js';
import { CODER_PROMPT_TEMPLATE, ERROR_CODES } from '../constants/index.js';
import { CODER_SYSTEM_PROMPT_TEMPLATE } from '../system-prompt/coder.js';
import { executeClaudeQuery } from '../utils/query-client.js';

export async function coder(
  docDirectory: string,
  codeDirectory: string,
  taskRequirement: string
): Promise<void> {
  try {
    console.log(`文档目录: ${docDirectory}`);
    console.log(`代码目录: ${codeDirectory}`);
    console.log(`任务需求: ${taskRequirement}`);

    // 生成文档目录存在
    let directoryExists = await checkDirectoryExists(docDirectory);
    if (!directoryExists) {
      throw new Error(`文档目录不存在: ${docDirectory}`, {
        cause: ERROR_CODES.DIRECTORY_NOT_FOUND,
      });
    }

    // 生成代码目录存在
    directoryExists = await checkDirectoryExists(codeDirectory);
    if (!directoryExists) {
      throw new Error(`代码目录不存在: ${codeDirectory}`, {
        cause: ERROR_CODES.DIRECTORY_NOT_FOUND,
      });
    }

    // 构建Claude查询prompt
    const prompt = buildPrompt(docDirectory, codeDirectory, taskRequirement);

    // 调用Claude进行生成
    console.log('正在使用Claude生成代码...');
    await queryClaude(prompt, docDirectory, codeDirectory, taskRequirement);
    console.log('代码生成完成');

  } catch (error) {
    console.error('代码生成失败:', error);
    throw new Error(`代码生成失败: ${error instanceof Error ? error.message : '未知错误'}`, {
      cause: ERROR_CODES.VALIDATION_FAILED,
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
  const prompt = CODER_PROMPT_TEMPLATE
    .replace('{{docDirectory}}', docDirectory)
    .replace('{{codeDirectory}}', codeDirectory)
    .replace('{{taskRequirement}}', taskRequirement)

  return prompt;
}

/**
 * 调用Claude查询
 */
async function queryClaude(prompt: string,docDirectory: string,
  codeDirectory: string,
  taskRequirement: string): Promise<void> {
  try {
    await executeClaudeQuery(prompt, {
      agents: {
              "coder": coderAgent(docDirectory, codeDirectory, taskRequirement ),
            },
      systemPrompt: CODER_SYSTEM_PROMPT_TEMPLATE
    });

  } catch (error) {
    console.error('Claude生成失败:', error);
    throw new Error(`Claude生成失败: ${error instanceof Error ? error.message : '未知错误'}`, {
      cause: ERROR_CODES.MODIFICATION_FAILED,
    });
  }
}
