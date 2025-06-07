# Browser Search Benchmark Report

- **Date:** 3/13/2025, 6:10:20 PM
- **System:** Darwin 24.3.0 (arm64)
- **CPU:** Apple M1 Max × 10 cores
- **Memory:** 64 GB
- **Node.js:** v20.13.1

## Benchmark Configuration

- **Query:** "GUI Agent"
- **Runs per engine:** 10
- **Results per run:** 5
- **Headless mode:** true

## Results

| Engine | Total Results | Avg Results/Run | Total Time (ms) | Avg Time/Run (ms) | Min Time (ms) | Max Time (ms) |
| ------ | ------------: | --------------: | --------------: | ----------------: | ------------: | ------------: |
| BAIDU | 50 | 5.00 | 35081.60 | 3508.16 | 2396.97 | 6664.79 |
| BING | 200 | 20.00 | 52344.54 | 5234.45 | 4393.95 | 7213.10 |
| GOOGLE | 50 | 5.00 | 76994.49 | 7699.45 | 4276.44 | 15904.73 |

## Performance Comparison

The fastest engine was **BAIDU** with an average run time of 3508.16ms.

- **BING** was 49.21% slower than BAIDU
- **GOOGLE** was 119.47% slower than BAIDU

## Result Quality Comparison

| Engine | Avg Results/Run | Notes |
| ------ | --------------: | ----- |
| BAIDU | 5.00 | Excellent result delivery rate |
| BING | 20.00 | Excellent result delivery rate |
| GOOGLE | 5.00 | Excellent result delivery rate |