/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConsoleLogger, LogLevel } from '@agent-infra/logger';
import { BrowserSearch } from '../src';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { performance } from 'perf_hooks';

interface BenchmarkResult {
  engine: string;
  runs: number;
  totalResults: number;
  avgResultsPerRun: number;
  totalTime: number;
  avgTimePerRun: number;
  minTime: number;
  maxTime: number;
}

async function runBenchmark() {
  const logger = new ConsoleLogger('[BrowserSearch Benchmark]', LogLevel.INFO);

  // Configuration
  const QUERY = 'GUI Agent';
  const RUNS = 10;
  const COUNT_PER_RUN = 5;
  const ENGINES = ['google', 'bing', 'baidu'] as const;

  // Create temp directory for results
  const tmpDir = path.join(process.cwd(), '.tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  logger.info(`Starting benchmark for query: "${QUERY}"`);
  logger.info(`Runs per engine: ${RUNS}`);
  logger.info(`Results per run: ${COUNT_PER_RUN}`);
  logger.info(`Results will be saved to: ${tmpDir}`);

  const benchmarkResults: BenchmarkResult[] = [];

  for (const engine of ENGINES) {
    logger.info(`\n=== Testing ${engine.toUpperCase()} search engine ===`);

    const browserSearch = new BrowserSearch({
      logger,
      browserOptions: {
        headless: true,
      },
      defaultEngine: engine as any,
    });

    const runTimes: number[] = [];
    let totalResults = 0;

    try {
      for (let i = 0; i < RUNS; i++) {
        logger.info(`Run ${i + 1}/${RUNS}`);

        const startTime = performance.now();

        const results = await browserSearch.perform({
          query: QUERY,
          count: COUNT_PER_RUN,
          engine: engine as any,
          keepBrowserOpen: i < RUNS - 1, // Keep browser open except for last run
        });

        const endTime = performance.now();
        const runTime = endTime - startTime;
        runTimes.push(runTime);

        totalResults += results.length;

        // Save results to file
        const resultsFileName = `${engine}-run-${i + 1}-${Date.now()}.json`;
        const resultsFilePath = path.join(tmpDir, resultsFileName);

        fs.writeFileSync(
          resultsFilePath,
          JSON.stringify(results, null, 2),
          'utf8',
        );

        logger.info(
          `Run ${i + 1} completed in ${runTime.toFixed(2)}ms with ${results.length} results`,
        );
        logger.info(`Results saved to ${resultsFilePath}`);
      }

      const totalTime = runTimes.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / RUNS;
      const minTime = Math.min(...runTimes);
      const maxTime = Math.max(...runTimes);

      benchmarkResults.push({
        engine,
        runs: RUNS,
        totalResults,
        avgResultsPerRun: totalResults / RUNS,
        totalTime,
        avgTimePerRun: avgTime,
        minTime,
        maxTime,
      });

      logger.success(`${engine.toUpperCase()} benchmark completed`);
    } catch (error) {
      logger.error(`Error during ${engine} benchmark:`, error);
    } finally {
      await browserSearch.closeBrowser();
    }
  }

  // Generate Markdown report
  generateBenchmarkReport(benchmarkResults, QUERY, COUNT_PER_RUN, tmpDir);
}

function generateBenchmarkReport(
  results: BenchmarkResult[],
  query: string,
  countPerRun: number,
  outputDir: string,
) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

  const reportFileName = `benchmark-report-${dateStr}-${timeStr}.md`;
  const reportPath = path.join(outputDir, reportFileName);

  const report = [
    '# Browser Search Benchmark Report',
    '',
    `**Date:** ${now.toLocaleString()}`,
    `**System:** ${os.type()} ${os.release()} (${os.arch()})`,
    `**CPU:** ${os.cpus()[0].model} × ${os.cpus().length} cores`,
    `**Memory:** ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
    `**Node.js:** ${process.version}`,
    '',
    '## Benchmark Configuration',
    '',
    `- **Query:** "${query}"`,
    `- **Runs per engine:** ${results[0]?.runs || 0}`,
    `- **Results per run:** ${countPerRun}`,
    `- **Headless mode:** true`,
    '',
    '## Results',
    '',
    '| Engine | Total Results | Avg Results/Run | Total Time (ms) | Avg Time/Run (ms) | Min Time (ms) | Max Time (ms) |',
    '| ------ | ------------: | --------------: | --------------: | ----------------: | ------------: | ------------: |',
  ];

  // Sort results by average time (fastest first)
  const sortedResults = [...results].sort(
    (a, b) => a.avgTimePerRun - b.avgTimePerRun,
  );

  for (const result of sortedResults) {
    report.push(
      `| ${result.engine.toUpperCase()} | ${result.totalResults} | ${result.avgResultsPerRun.toFixed(2)} | ${result.totalTime.toFixed(2)} | ${result.avgTimePerRun.toFixed(2)} | ${result.minTime.toFixed(2)} | ${result.maxTime.toFixed(2)} |`,
    );
  }

  // Add comparison section
  if (results.length > 1) {
    report.push(
      '',
      '## Performance Comparison',
      '',
      `The fastest engine was **${sortedResults[0].engine.toUpperCase()}** with an average run time of ${sortedResults[0].avgTimePerRun.toFixed(2)}ms.`,
      '',
    );

    // Calculate relative performance
    for (let i = 1; i < sortedResults.length; i++) {
      const percentSlower = (
        ((sortedResults[i].avgTimePerRun - sortedResults[0].avgTimePerRun) /
          sortedResults[0].avgTimePerRun) *
        100
      ).toFixed(2);
      report.push(
        `- **${sortedResults[i].engine.toUpperCase()}** was ${percentSlower}% slower than ${sortedResults[0].engine.toUpperCase()}`,
      );
    }

    // Add result quality comparison
    report.push(
      '',
      '## Result Quality Comparison',
      '',
      '| Engine | Avg Results/Run | Notes |',
      '| ------ | --------------: | ----- |',
    );

    for (const result of sortedResults) {
      const quality =
        result.avgResultsPerRun >= countPerRun
          ? 'Excellent'
          : result.avgResultsPerRun >= countPerRun * 0.8
            ? 'Good'
            : result.avgResultsPerRun >= countPerRun * 0.5
              ? 'Fair'
              : 'Poor';

      report.push(
        `| ${result.engine.toUpperCase()} | ${result.avgResultsPerRun.toFixed(2)} | ${quality} result delivery rate |`,
      );
    }
  }

  // Write report to file
  fs.writeFileSync(reportPath, report.join('\n'), 'utf8');

  console.log(`\n✅ Benchmark report generated: ${reportPath}`);
  console.log('\n' + report.join('\n'));
}

if (require.main === module) {
  runBenchmark().catch(console.error);
}
