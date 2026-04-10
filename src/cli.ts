#!/usr/bin/env node
import { createProgram } from "./cli/program";

const program = createProgram();
program.parseAsync(process.argv).catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
