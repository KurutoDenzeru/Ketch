//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    ignores: [".output/**", "node_modules/**", "dist/**", "bun.lock"],
  },
]
