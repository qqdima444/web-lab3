import { program } from 'commander';
import fs from 'node:fs';

function loadData(filePath) {
    try {
        const json = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(json);
    } catch (error) {
        console.error(
            `Помилка: не вдалося прочитати файл "${filePath}" або JSON має неправильний формат.`
        );
        process.exit(1);
    }
}

program
    .name('rpg-cli')
    .description('CLI-програма для роботи з даними RPG-персонажів')
    .version('1.0.0', '-V, --version', 'показати версію програми')
    .helpOption('-h, --help', 'показати довідку')
    .option('-f, --file <path>', 'шлях до JSON-файлу', 'data.json');

program.configureOutput({
    outputError: (str, write) => {
        let message = str;

        message = message.replace(
            /error: missing required argument '([^']+)'/,
            'Помилка: пропущено обов’язковий аргумент <$1>'
        );

        message = message.replace(
            /error: unknown option '([^']+)'/,
            'Помилка: невідома опція "$1"'
        );

        write(message);
    }
});

program
    .command('list')
    .description('показати стислий список персонажів')
    .option('-l, --limit <number>', 'обмежити кількість персонажів')
    .action((options, command) => {
        const globalOptions = command.optsWithGlobals();
        const data = loadData(globalOptions.file);

        if (!Array.isArray(data.characters)) {
            console.error('Помилка: у JSON-файлі відсутній масив characters.');
            process.exit(1);
        }

        let characters = data.characters;

        if (options.limit !== undefined) {
            const limit = Number(options.limit);

            if (!Number.isInteger(limit) || limit <= 0) {
                console.error('Помилка: значення --limit має бути додатним цілим числом.');
                process.exit(1);
            }

            characters = characters.slice(0, limit);
        }

        characters.forEach((character, index) => {
            console.log(`${index + 1}. ${character.name} — рівень ${character.level}`);
        });
    });

program
    .command('show <name>')
    .description('показати повну інформацію про персонажа')
    .action((name, options, command) => {
        const globalOptions = command.optsWithGlobals();
        const data = loadData(globalOptions.file);

        if (!Array.isArray(data.characters)) {
            console.error('Помилка: у JSON-файлі відсутній масив characters.');
            process.exit(1);
        }

        const character = data.characters.find(
            (character) => character.name.toLowerCase() === name.toLowerCase()
        );

        if (!character) {
            console.error(`Помилка: персонажа "${name}" не знайдено.`);
            process.exit(1);
        }

        console.log(JSON.stringify(character, null, 4));
    });

program
    .command('field <name> <path>')
    .description('показати значення окремого поля персонажа')
    .action((name, path, options, command) => {
        const globalOptions = command.optsWithGlobals();
        const data = loadData(globalOptions.file);

        if (!Array.isArray(data.characters)) {
            console.error('Помилка: у JSON-файлі відсутній масив characters.');
            process.exit(1);
        }

        const character = data.characters.find(
            (character) => character.name.toLowerCase() === name.toLowerCase()
        );

        if (!character) {
            console.error(`Помилка: персонажа "${name}" не знайдено.`);
            process.exit(1);
        }

        const parts = path.split('.');
        let value = character;

        for (const part of parts) {
            if (value !== null && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                console.error(`Помилка: поле "${path}" не знайдено.`);
                process.exit(1);
            }
        }

        if (value === null) {
            console.log('null');
        } else if (typeof value === 'object') {
            console.log(JSON.stringify(value, null, 4));
        } else {
            console.log(value);
        }
    });

program
    .command('stats <name>')
    .description('показати рівень і характеристики персонажа')
    .action((name, options, command) => {
        const globalOptions = command.optsWithGlobals();
        const data = loadData(globalOptions.file);

        if (!Array.isArray(data.characters)) {
            console.error('Помилка: у JSON-файлі відсутній масив characters.');
            process.exit(1);
        }

        const character = data.characters.find(
            (character) => character.name.toLowerCase() === name.toLowerCase()
        );

        if (!character) {
            console.error(`Помилка: персонажа "${name}" не знайдено.`);
            process.exit(1);
        }

        console.log(`Ім'я: ${character.name}`);
        console.log(`Рівень: ${character.level}`);
        console.log(`Здоров'я: ${character.health_points}`);
        console.log(`Витривалість: ${character.stamina}`);
        console.log(`Сила: ${character.power}`);
        console.log(`Спритність: ${character.agility}`);
    });

program
    .command('inventory <name>')
    .description('показати інвентар персонажа')
    .option('-t, --type <type>', 'відбір предметів за типом')
    .option('-e, --equipped', 'показати лише екіпіровані предмети')
    .action((name, options, command) => {
        const globalOptions = command.optsWithGlobals();
        const data = loadData(globalOptions.file);

        if (!Array.isArray(data.characters)) {
            console.error('Помилка: у JSON-файлі відсутній масив characters.');
            process.exit(1);
        }

        const character = data.characters.find(
            (character) => character.name.toLowerCase() === name.toLowerCase()
        );

        if (!character) {
            console.error(`Помилка: персонажа "${name}" не знайдено.`);
            process.exit(1);
        }

        if (!Array.isArray(character.inventory)) {
            console.error(`Помилка: у персонажа "${name}" відсутній інвентар.`);
            process.exit(1);
        }

        let inventory = character.inventory;

        if (options.type) {
            inventory = inventory.filter(
                (item) => item.type.toLowerCase() === options.type.toLowerCase()
            );
        }

        if (options.equipped) {
            inventory = inventory.filter(
                (item) => item.is_equipped === true
            );
        }

        if (inventory.length === 0) {
            console.log('Предметів за заданими умовами не знайдено.');
            return;
        }

        inventory.forEach((item, index) => {
            console.log(
                `${index + 1}. ${item.name} — тип: ${item.type}, екіпіровано: ${item.is_equipped ? 'так' : 'ні'}`
            );
        });
    });

program
    .command('skill <name> <skill>')
    .description('показати відомості про обрану навичку персонажа')
    .action((name, skill, options, command) => {
        const globalOptions = command.optsWithGlobals();
        const data = loadData(globalOptions.file);

        if (!Array.isArray(data.characters)) {
            console.error('Помилка: у JSON-файлі відсутній масив characters.');
            process.exit(1);
        }

        const character = data.characters.find(
            (character) => character.name.toLowerCase() === name.toLowerCase()
        );

        if (!character) {
            console.error(`Помилка: персонажа "${name}" не знайдено.`);
            process.exit(1);
        }

        if (!Array.isArray(character.skills)) {
            console.error(`Помилка: у персонажа "${name}" відсутній список навичок.`);
            process.exit(1);
        }

        const skillIndex = character.skills.findIndex(
            (item) => item.toLowerCase() === skill.toLowerCase()
        );

        if (skillIndex === -1) {
            console.error(
                `Помилка: навичку "${skill}" у персонажа "${name}" не знайдено.`
            );
            process.exit(1);
        }

        console.log(`Персонаж: ${character.name}`);
        console.log(`Навичка: ${character.skills[skillIndex]}`);
        console.log(`Позиція у списку навичок: ${skillIndex + 1}`);
    });

program.parse();