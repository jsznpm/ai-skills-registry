import { Command } from "commander";
import { setRegistry } from "./config.js";
import { listCommand } from "./commands/list.js";
import { searchCommand } from "./commands/search.js";
import { addCommand } from "./commands/add.js";
import { infoCommand } from "./commands/info.js";
import { removeCommand } from "./commands/remove.js";
import { updateCommand } from "./commands/update.js";

const program = new Command();

program
  .name("skillpool")
  .description("Package manager for the AI Skills Registry")
  .version("1.0.0")
  .option(
    "-r, --registry <source>",
    "registry source (http url or local folder path)"
  )
  .hook("preAction", (thisCommand) => {
    setRegistry(thisCommand.opts().registry);
  });

program
  .command("list")
  .description("list all skills in the registry")
  .option("-l, --long", "show version and description")
  .action(listCommand);

program
  .command("search <query>")
  .description("search skills by name, description, or tag")
  .action(searchCommand);

program
  .command("add <skill>")
  .description("install a skill into ./.skills (supports name@version)")
  .action(addCommand);

program
  .command("info <skill>")
  .description("show details for a skill")
  .action(infoCommand);

program
  .command("remove <skill>")
  .description("remove an installed skill from ./.skills")
  .action(removeCommand);

program
  .command("update [skill]")
  .description("update installed skills (all, or one) to registry version")
  .action(updateCommand);

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(`✗ ${(err as Error).message}`);
  process.exit(1);
});
