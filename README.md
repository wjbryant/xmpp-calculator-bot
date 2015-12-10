# XMPP Calculator Bot

## Setup

This application was tested on a Windows 8.1 64-bit machine using Pidgin and
a DuckDuckGo XMPP account created by following the instructions at
https://duck.co/blog/using-pidgin-with-xmpp-jabber.

1. Download and install Node.js from http://nodejs.org/ (v0.10.26)

1. Download and extract the project source code

1. Some dependencies require compilation.
  * *For Windows, this will require:*
    * Python v2.7.6 (http://www.python.org/downloads/ - 2.7.x should work as well)
    * Visual Studio for C++ (I used Visual Studio Express 2013 for Windows Desktop:
      [download link](http://www.visualstudio.com/en-us/downloads/download-visual-studio-vs#DownloadFamilies_2))
  * *For Linux, this will require (if not already installed by default):*
    * Pyhton v2.7.6 (install via system package manager - 2.7.x should work as well)
    * GCC (install via system package manager)
  * *See node-gyp system requirements for more details:
    https://github.com/TooTallNate/node-gyp#installation*

1. Some development dependencies require git to be installed.
  * Windows: Download and install "Git for Windows"
    ([download link](http://git-scm.com/download/win)).
    Select the option to run Git from the Windows command prompt.
  * Linux: Install via system package manager (ex: `apt-get install git`)

1. Run `npm install` from the project root directory to download all the dependencies

1. Edit the credentials in config.json (must use an existing XMPP account).
   If the password field is set to an empty string or removed, you will be
   prompted for your password on the command line when the program starts.

1. Run `node app.js` from the project root directory to start the program. The
   user specified in the config file credentials will appear online. Use
   another XMPP account and a program such as Pidgin to chat with the bot. To
   stop the program, press ctrl+c in the command prompt. The bot will be
   disconnected. The program may also be run in offline, single-user mode by
   running `node cli.js`. The offline program can be terminated with the `exit`
   command.

One of the dependencies, node-stringprep, has an optional dependency on the ICU
library. It will fallback to JavaScript if the library was not available during
compilation, so the warning message about StringPrep bindings can be ignored.
See https://github.com/node-xmpp/node-stringprep#installation.

### External Libraries Used

The following node modules were used:

* node-xmpp-client v0.1.9 (https://github.com/node-xmpp/node-xmpp-client)
* ltx v0.4.0 (https://github.com/node-xmpp/ltx)
* read v1.0.5 (https://github.com/isaacs/read)

These dependencies are defined in the `package.json` file and are automatically
downloaded and installed when `npm install` is run as detailed in the steps above.

## Usage

### Commands

#### hello
Outputs "world"

#### author
Outputs the author's name

#### help
Outputs help information (commands and usage)

### Mathematical Calculations

This bot can also perform basic mathematical calculations (exponents are not
supported). Variables may be assigned using the format: `x = 1`. Variable names
may consist of a single letter and are case sensitive. Variables may also be
used in calculations. For example:

    a = 1
    b = 2
    2 * (a+b)
    -> 6

Note that expressions are evaluated immediately, for example:

    a = 1
    b = a + 2

will set `a` to 1 and `b` to 3.
If `a` is then set to 2: `a = 2`, `b` will remain 3, since the expression
`a + 2` is not re-evaluated.

## Running the Tests

In order to run the tests, you must have grunt-cli installed. To do this, run
`npm install -g grunt-cli`. Next, from the command prompt in the project root
directory, run `grunt test`. This will run the unit tests using Jasmine.

The default task can be run with `grunt` and no task name. This will check the
code for errors with jshint, run the unit tests, and generate the code
documentation.

## Design Decisions

The mathematical expression parsing libraries I looked at are all too large and
complex for the simple expressions supported by this application. I also did not
want to use `eval()` as it could potentially allow unwanted code to be executed.
The application uses regular expressions and string manipulation to the parse
mathematical expressions it receives.

Also, since multiple users can chat with the bot simultaneously, variables are
unique to each user. For example:

User 1: `a = 1`

User 2: `a = 2`

User 1: `a + 3` -> `4`

User 2: `a + 3` -> `5`


##### Created by Bill Bryant, 2014
