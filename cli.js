/** @author Bill Bryant */

'use strict';

var read = require('read'),
    command = require('./command');

/**
 * Reads input from the terminal and displays the result of the entered
 * commands.
 */
function readInput() {
    read({ prompt: '>' }, function (err, input) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        input = input.trim();

        if (input) {
            // support exit command for cli
            if (input.toLowerCase() === 'exit') {
                process.exit();
            }

            console.log(command.execute(input, 'cli', false));
        }

        readInput();
    });
}

readInput();
