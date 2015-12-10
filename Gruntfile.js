'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'app.js',
                'command.js',
                'utils.js',
                'spec/commandSpec.js',
                'spec/utilsSpec.js'
            ]
        },
        'jasmine_node': {
            all: ['spec/']
        },
        clean: {
            docs: ['docs']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('generateAPIDocs',
        'Generates API documentation using JSDoc 3.', function () {

        var done = this.async(),
            jsdoc = 'node_modules/.bin/jsdoc',
            cmd = jsdoc,
            args = [];

        // work around for https://github.com/joyent/node/issues/2318
        if (process.platform === 'win32') {
            cmd = 'cmd';
            args.push('/c', jsdoc.replace(/\//g, '\\'));
        }

        args.push('-d', 'docs', '-p', 'command.js', 'utils.js');

        grunt.util.spawn(
            {
                cmd: cmd,
                args: args
            },
            function (error, result) {
                if (error) {
                    grunt.log.error(result.toString());
                }
                done(!error);
            }
        );
    });

    // default: lint, test, generate docs
    grunt.registerTask('default', [
        'jshint', 'env:test', 'jasmine_node', 'clean:docs', 'generateAPIDocs'
    ]);

    // test: run tests only
    grunt.registerTask('test', [ 'env:test', 'jasmine_node' ]);
};
