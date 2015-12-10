/*global describe, it, expect */

'use strict';

var command = require('../command');

describe('command module', function () {
    describe('execute method', function () {
        it('should respond to "hello" with "world"', function () {
            expect(command.execute('hello')).toEqual('world');
        });

        it('should respond to "author" with "Bill Bryant"', function () {
            expect(command.execute('author')).toEqual('Bill Bryant');
        });

        it('should respond to "help" with a list of commands', function () {
            expect(command.execute('help')).toMatch('Commands');
        });

        it('should respond to an unknown command with an error message', function () {
            expect(command.execute('fakecommand')).toMatch('Error');
        });
    });
});
