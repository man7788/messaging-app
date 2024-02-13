import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// The issue was with my ESLInt not recognizing the vitest globals which we enabled in the lesson setup.
// I solved it by installing the vitest plugin using:

// npm install -D eslint-plugin-vitest-globals

// and then adding the following to the ESLint config file:

// {
//   "extends": ["plugin:vitest-globals/recommended"],
//   "env": {
//     "vitest-globals/env": true
//   }
// }
