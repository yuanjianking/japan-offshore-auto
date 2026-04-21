/**
 * 代码维护流水线中控器
 */

import { reviewer } from './services/reviewer.js';
import { planner } from './services/planner.js';
import { coder } from './services/coder.js';
import { writer } from './services/writer.js';
import {
  createPipelineContext,
  updatePipelineContext,
  logPipelineExecution,
} from './utils/common.js';
import type {
  PipelineContext,
} from './types/index.js';

/**
 * 运行完整的代码维护流水线
 */
export async function runPipeline(
  docDirectory: string,
  codeDirectory: string,
  taskRequirement: string
): Promise<PipelineContext> {
  let context = createPipelineContext(docDirectory, codeDirectory, taskRequirement);

  try {
    console.log('🚀 启动代码维护流水线');
    console.log(`📁 文档目录: ${docDirectory}`);
    console.log(`📁 代码目录: ${codeDirectory}`);
    console.log(`🎯 任务需求: ${taskRequirement}`);

    // 记录开始时间
    await logPipelineExecution(context);

    // 阶段1: 代码分析
    context = updatePipelineContext(context, { status: 'analyzing' });
    await logPipelineExecution(context);
    console.log('\n--- 阶段1: 代码分析 ---');

    await planner(docDirectory, codeDirectory, taskRequirement);
    context = updatePipelineContext(context, {
      status: 'modifying',
    });
    await logPipelineExecution(context);

    console.log('✅ 代码分析完成');

    // 阶段2: 代码修改
    console.log('\n--- 阶段2: 代码修改 ---');

    await coder(docDirectory, codeDirectory, taskRequirement);
    context = updatePipelineContext(context, {
      status: 'validating',
    });
    await logPipelineExecution(context);

    console.log('✅ 代码修改完成');

    // 阶段3: 设计生成
    console.log('\n--- 阶段3: 设计生成 ---');

    await writer(docDirectory, codeDirectory, taskRequirement);
    context = updatePipelineContext(context, {
      status: 'validating',
    });
    await logPipelineExecution(context);

    console.log('✅ 设计生成完成');


    // 阶段4: 代码验证
    console.log('\n--- 阶段4: 代码验证 ---');

    await reviewer(docDirectory, codeDirectory, taskRequirement);
    context = updatePipelineContext(context, {
      status: 'completed',
      endTime: new Date().toISOString(),
    });
    await logPipelineExecution(context);

    console.log('✅ 代码验证完成');

    console.log('\n🎉 代码维护流水线执行完成！');
    return context;
  } catch (error) {
    console.error('\n❌ 流水线执行失败:', error);

    context = updatePipelineContext(context, {
      status: 'failed',
      error: error instanceof Error ? error.message : '未知错误',
      endTime: new Date().toISOString(),
    });
    await logPipelineExecution(context);

    throw error;
  }
}


/**
 * 获取流水线执行状态
 */
export function getPipelineStatus(context: PipelineContext): string {
  return context.status;
}

/**
 * 获取流水线执行摘要
 */
export function getPipelineSummary(context: PipelineContext): {
  status: string;
  codeDirectory: string;
  taskRequirement: string;
  startTime: string;
  endTime?: string;
  error?: string;
} {
  return {
    status: context.status,
    codeDirectory: context.codeDirectory,
    taskRequirement: context.taskRequirement,
    startTime: context.startTime,
    endTime: context.endTime,
    error: context.error,
  };
}

/**
 * 导出完整流水线上下文（用于调试）
 */
export function exportPipelineContext(context: PipelineContext): PipelineContext {
  return { ...context };
}