import { Command } from "commander";
import { createGenerateCommand } from "./commands/generate";
import { createMergeCommand } from "./commands/merge";
import { createListTemplatesCommand } from "./commands/list-templates";
import { createInfoCommand } from "./commands/info";

export function createProgram(): Command {
  const program = new Command("md-to-pdf")
    .description("Professional PDF generation from Markdown")
    .version("2.0.0");

  program.addCommand(createGenerateCommand(), { isDefault: true });
  program.addCommand(createMergeCommand());
  program.addCommand(createListTemplatesCommand());
  program.addCommand(createInfoCommand());

  return program;
}
