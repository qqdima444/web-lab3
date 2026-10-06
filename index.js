import { program } from 'commander';
import fs from 'node:fs';

program
    .name('rpg-cli')
    .description('CLI-програма для роботи з даними RPG-персонажів')
    .version('1.0.0', '-V, --version', 'показати версію програми')
    .helpOption('-h, --help', 'показати довідку')
    .option('-f, --file <path>', 'шлях до JSON-файлу', 'data.json');

program.parse();

const options = program.opts();

function loadData(filePath) {
    try {
        const json = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(json);
    } catch (error) {
        console.error(`Помилка: не вдалося прочитати файл "${filePath}" або JSON має неправильний формат.`);
        process.exit(1);
    }
}

const data = loadData(options.file);