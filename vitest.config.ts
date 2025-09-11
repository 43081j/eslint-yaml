import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: './test/setup.ts',
    include: [
      "test/**/*_test.ts",
    ],
    coverage: {
      reporter: ['text', 'lcov'],
      include: [
        "src/**/*.ts"
      ]
    }
  }
});
