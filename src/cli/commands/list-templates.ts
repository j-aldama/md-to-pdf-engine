import { Command } from "commander";
import { getAllTemplates } from "../../templates";

export function createListTemplatesCommand(): Command {
  return new Command("list-templates")
    .description("List available PDF templates")
    .action(() => {
      const templates = getAllTemplates();
      console.log("Available templates:\n");
      for (const t of templates) {
        console.log(`  ${t.id}`);
        console.log(`    Name:    ${t.name}`);
        console.log(`    Colors:  primary=${t.colors.primary}  secondary=${t.colors.secondary}`);
        console.log(`    Fonts:   ${t.fonts.heading} / ${t.fonts.body}`);
        console.log(`    Margins: ${t.margins.top}mm ${t.margins.right}mm ${t.margins.bottom}mm ${t.margins.left}mm`);
        console.log("");
      }
    });
}
