# How to Run the Stress Tests

## Quick Start

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open the test page in your browser:**

   ```
   http://localhost:3000/stress-test.html
   ```

3. **Click the "Run Stress Tests" button**

4. **Wait for results** (may take 30-60 seconds for all tests)

## What Gets Tested

The stress test will run the optimized schema parser against schemas with:

- 100 tables
- 500 tables
- 1,000 tables
- 2,500 tables
- 5,000 tables
- 7,500 tables

Each test runs **5 times** and reports the trimmed mean (excluding min/max) for accurate results.

## Test Output

You'll see:

- ✅ Execution time for each test size
- 📊 Tables, fields, and relations parsed
- ⚡ Throughput (tables per second)
- 📈 Scaling efficiency analysis
- 💡 Recommendations based on results

## Understanding the Results

### Good Performance Indicators:

- **Scaling efficiency >70%**: Near-linear performance
- **Throughput >10,000 tables/sec**: Excellent for small-medium schemas
- **7,500 tables parsed in <1 second**: Great overall performance

### When to Use WebWorker:

- Schema has 2,500+ tables
- Parsing takes >200ms
- UI responsiveness is critical

### When to Consider WASM (C++):

- Schema has 10,000+ tables regularly
- Parsing is done frequently (>10x per session)
- Maximum performance is critical
- Development resources available

## Files Created

- `src/utils/schemaParser.ts` - Optimized main parser
- `src/workers/schemaParser.worker.ts` - WebWorker implementation
- `src/utils/schemaParserWorker.ts` - WebWorker wrapper
- `src/utils/browserStressTest.ts` - Browser-compatible test runner
- `stress-test.html` - Interactive test UI
- `OPTIMIZATION_REPORT.md` - Detailed optimization documentation

## Optimizations Applied

1. ✅ Replaced `regex.test()` with `string.includes()` for 2-3x faster string checks
2. ✅ Pre-compiled string constants to reduce allocations
3. ✅ Adaptive data structures (Map vs Array based on data size)
4. ✅ Early break optimization for single primary keys
5. ✅ WebWorker implementation for non-blocking parsing

## Next Steps

After running the tests:

1. Review the performance summary in the console
2. Check scaling efficiency
3. Decide if WebWorker is needed for your use case
4. See `OPTIMIZATION_REPORT.md` for C++/WASM guidance if needed
