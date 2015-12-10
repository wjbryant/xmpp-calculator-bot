/**
 * @module command
 * @author Bill Bryant
 */

'use strict';

var utils = require('./utils');

/**
 * Executes a command and returns the resulting text.
 *
 * @param  {String}  command           The command to execute
 * @param  {String}  account           The account that sent the command
 * @param  {Boolean} [logErrors=true]  Whether to log error messages to the
 *                                     console
 * @return {String}                    The result of executing the command
 */
exports.execute = function (command, account, logErrors) {
    var output;

    // set default value for logErrors param if omitted
    if (logErrors === undefined) {
        logErrors = true;
    }

    // remove any leading and trailing whitespace from command
    command = command.trim();

    // commands are case insensitive (except for variable names)
    switch (command.toLowerCase()) {
    case 'hello':
        output = 'world';
        break;
    case 'author':
        output = 'Bill Bryant';
        break;
    case 'help':
        output = '\nCommands:\n' +
            'hello\n    Output "world"\n' +
            'author\n    Output author name\n' +
            'help\n    Output this help message\n' +
            '\nThis bot can also perform basic mathematical calculations ' +
            '(exponents are not supported). Variables may be assigned using ' +
            'the format:\nx = 1\nVariable names may consist of a single ' +
            'letter and are case sensitive. Variables may also be used in ' +
            'calculations. For example:\na = 1\nb = 2\n2 * (a+b)\n-> 6';
        break;
    default:
        try {
            if (command.indexOf('=') !== -1) {
                output = utils.evaluateEquation(command, account);
            } else if (/[+\-*\/]/.test(command)) {
                output = utils.evaluateExpression(command, account);
            } else if (/^[a-zA-Z]$/.test(command)) {
                output = utils.getVariable(command, account);
            } else {
                output = 'Error: Unrecognized command';
                if (logErrors) {
                    console.error(output);
                }
            }
        } catch (err) {
            // display the error message if an error occurred, but do not exit
            output = err.toString();
            if (logErrors) {
                console.error(err);
            }
        }
    }

    return output;
};
