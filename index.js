import { program } from 'commander';

program
    .name('rpg-cli')
    .description('CLI-програма для роботи з даними RPG-персонажів')
    .version('1.0.0', '-V, --version', 'показати версію програми')
    .helpOption('-h, --help', 'показати довідку')
    .option('-f, --file <path>', 'шлях до JSON-файлу', 'data.json');

program.parse();