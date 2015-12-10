/** @author Bill Bryant */

'use strict';

var Client = require('node-xmpp-client'),
    ltx = require('ltx'),
    read = require('read'),
    command = require('./command'),
    utils = require('./utils'),
    config,
    credentials;

/**
 * Connects the client to the XMPP server using the credentials in config.json.
 * Also, sets up event handlers for the client.
 */
function connect() {
    console.log('Attempting to establish a connection...');

    // this creates a new client and connects to the server
    var client = new Client(credentials);

    // write any error messages to the console and exit
    client.on('error', function (err) {
        console.error(err);
        process.exit(1);
    });

    // when the client connects online
    client.on('online', function () {
        // let everyone know we're online
        client.send(new ltx.Element('presence', {}));

        // log the connection details to the console
        console.log('Connected to %s:%d as %s', credentials.host,
            credentials.port, credentials.jid);
    });

    // when the client receives a stanza
    client.on('stanza', function (stanza) {
        var message,
            reply,
            replyText;

        // if this is a chat message that contains text in a body element
        if (stanza.is('message') && stanza.attrs.type === 'chat' &&
            stanza.getChild('body')) {

            // get the text of the message as a string
            message = stanza.getChild('body').getText();

            // execute the command and save the response text
            replyText = command.execute(message, stanza.attrs.from);

            // if there is a response to send
            if (replyText) {
                // create the reply stanza
                reply = new ltx.Element('message', {
                    to: stanza.attrs.from,
                    from: stanza.attrs.to,
                    type: 'chat'
                });
                // insert the reply text into the stanza
                reply.c('body').t(replyText);

                // send it
                client.send(reply);
            }
        } else if (stanza.is('presence') && stanza.attrs.type === 'unavailable') {
            utils.deleteVariables(stanza.attrs.from);
        }
    });

    // disconnect client when program is stopped
    process.on('exit', function () {
        client.end();
    });
}

// read the config file and get the credentials
try {
    console.log('\nReading config file...');
    config = require('./config.json');
    credentials = config.credentials;
} catch (err) {
    console.error('Error reading config file.\n', err);
    process.exit(1);
}

// prompt for password if left blank
if (!credentials.password) {
    read({ prompt: 'Password: ', silent: true }, function (err, password) {
        if (err) {
            // print any errors to the console and exit
            console.error(err);
            process.exit(1);
        } else {
            // set the password and connect
            credentials.password = password;
            connect();
        }
    });
} else {
    // password was specified in the config file, connect to the server
    connect();
}
