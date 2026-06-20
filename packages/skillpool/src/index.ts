import { Command } from "commander";
import { setRegistry } from "./config.js";
import { listCommand } from "./commands/list.js";
import { searchCommand } from "./commands/search.js";
import { addCommand } from "./commands/add.js";
import { infoCommand } from "./commands/info.js";
import { removeCommand } from "./commands/remove.js";
import { updateCommand } from "./commands/update.js";
import { BANNER, showBannerOnce } from "./banner.js";

showBannerOnce();

const program = new Command();

program.addHelpText("beforeAll", BANNER);

program
  .name("skillpool")
  .description("Package manager for the AI Skills Registry (skills, commands, agents)")
  .version("2.1.0")
  .option(
    "-r, --registry <source>",
    "registry source (http url or local folder path)"
  )
  .hook("preAction", (thisCommand) => {
    setRegistry(thisCommand.opts().registry);
  });

program
  .command("list")
  .description("list/select resources; interactive picker installs your selection")
  .option("-l, --long", "show version and description")
  .option("-t, --type <type>", "filter by type: skill | command | agent")
  .action(listCommand);

program
  .command("search <query>")
  .description("search resources by name, description, or tag")
  .action(searchCommand);

program
  .command("add [resource]")
  .description(
    "install a resource into ./.claude (supports type:name@version); no arg opens picker"
  )
  .action(addCommand);

program
  .command("info <resource>")
  .description("show details for a resource (supports type:name)")
  .action(infoCommand);

program
  .command("remove <resource>")
  .description("remove an installed resource (supports type:name)")
  .action(removeCommand);

program
  .command("update [resource]")
  .description("update installed resources (all, or one) to registry version")
  .action(updateCommand);

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(`✗ ${(err as Error).message}`);
  process.exit(1);
});
