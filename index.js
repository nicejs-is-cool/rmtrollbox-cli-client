#!/usr/bin/env node
const ansi = require('ansi')(process.stdout);
const readline = require('readline');
const io = require('socket.io-client');
const chroma = require('chroma-js')
const blessed = require('reblessed')
const util = require('util');
const he = require('he');

var screen = blessed.screen({
    smartCSR: true
});

function parseColor(color) {
    try {
        return chroma(color).hex();
    } catch {
        return "#ffffff";
    }
    
}
const socket = io('https://rmtrollbox.eu-gb.mybluemix.net');

let terminal = {
    maxY: process.stdout.rows,
    maxX: process.stdout.columns
}
/*const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});*/
let inputBoxPos = {
    x: 0,
    y: terminal.maxY
}
let chatBoxDimensions = {
    startX: 0,
    startY: inputBoxPos.y-1
}
let lastMessagePos = {
    x: 0,
    y: 0
}


let nickname = "cliclient-test";
let color = "red";

var connectingBox = blessed.box({
    top: 'center',
    left: 'center',
    width: '20%',
    height: '10%',
    label: 'Please wait...',
    content: 'Connecting...',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      //bg: 'magenta',
      border: {
        fg: '#f0f0f0'
      },
      hover: {
        bg: 'green'
      }
    }
});

screen.append(connectingBox);

screen.render()

socket.on('connect', () => {
    //socket.emit('user joined', nickname, color, '', '')
    screen.remove(connectingBox);
    //screen.render();
    askUsername();
})
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});
/*console.clear()
function printChatBox() {
    ansi.goto(inputBoxPos.x, inputBoxPos.y).fg.hex(parseColor(color)).write(nickname).reset().write(' > ')
}
printChatBox();
rl.on('line', (line) => {
    socket.send(line)
    ansi.goto(inputBoxPos.x, inputBoxPos.y-1).eraseLine();
    printChatBox();
})
*/
async function askUsername() {
    let usernameBox = blessed.box({
        top: 'center',
        left: 'center',
        width: '50%',
        height: '30%',
        label: 'rmtrollbox',
        content: 'Log in',
        tags: true,
        border: {
          type: 'line'
        },
        style: {
          fg: 'white',
          border: {
            fg: '#f0f0f0'
          },
        }
    });
    let usernameInput = blessed.textbox({
        parent: usernameBox,
        top: '0%',
        //left: 'left',
        //align: 'left',
        width: '90%',
        height: '40%',
        label: 'Username',
        content: '',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: {
                fg: '#f0f0f0'
            },
        }
    });
    let colorInput = blessed.textbox({
        parent: usernameBox,
        top: '40%',
        //left: 'left',
        //align: 'left',
        width: '90%',
        height: '40%',
        label: 'CSS Color',
        content: '',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: {
                fg: '#f0f0f0'
            },
        }
    });
    screen.append(usernameBox);
    usernameBox.focus();
    usernameInput.focus();
    colorInput.focus();
    screen.render();
    function readInputAsync(input) {
        return util.promisify(input.readInput).bind(input)();
    }
    let username = await readInputAsync(usernameInput);
    let color = await readInputAsync(colorInput);

    screen.remove(usernameBox);
    screen.render();
    socket.emit('user joined', username, color, '', '')
    return openChatBox(username, color);
}
function susMessageParse(msg, username) {
    return blessed.escape(msg)
        .replace(/<b>(.*)<\/b>/g, (str, x) => `{bold}${x}{/bold}`)
        .replace(/<i>(.*)<\/i>/g, (str, x) => `{italic}${x}{/italic}`)
        .replace(/<em>(.*)<\/em>/g, (str, x) => `{italic}${x}{/italic}`)
        .replace(/<u>(.*)<\/u>/g, (str, x) => `{underline}${x}{/underline}`)
        .replace(/<blink>(.*)<\/blink>/g, (str, x) => `{blink}${x}{/blink}`)
        .replace(/<br>/g, "\n")
        .replace(new RegExp(`@${username}`, "g"), "{bold}{yellow-fg}@" + username + "{/yellow-fg}{/bold}")
        .replace(new RegExp("@everyone", "g"), "{bold}{yellow-fg}@everyone{/yellow-fg}{/bold}")
        
        
        //.replace(/<strike>(.*)<\/strike>/g, (str, x) => `{strikethrough}${x}{/strikethrough}`)
        
}
function openChatBox(username, color) {
    let chatBox = blessed.box({
        top: 'top',
        left: 'left',
        width: '80%',
        height: '80%',
        label: 'Chat',
        //content: 'Welcome to rmtrollbox!',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: {
                fg: '#f0f0f0'
            },
        },
        scrollable: true
    });
    let userlist = blessed.list({
        //parent: chatBox,
        //top: '0%',
        left: '80%',
        //align: 'right',
        width: '20%',
        height: '100%',
        label: 'Users',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: {
                fg: '#f0f0f0'
            },
        }
    });
    let chatInput = blessed.textbox({
        //parent: chatBox,
        parent: screen,
        keys: true,
        mouse: true,
        top: '90%',
        left: '0%',
        width: '80%',
        height: '10%',
        label: 'Input',
        content: '',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: {
                fg: '#f0f0f0'
            },
            hover: {
                bg: 'white',
                fg: 'black'
            }
        },
        clickable: true,
        keyable: true
    });
    let typingDisplay = blessed.box({
        //parent: chatBox,
        top: '80%',
        left: '0%',
        width: '80%',
        height: '10%',
        label: 'Typing',
        content: '',
        tags: true,
        border: {
            type: 'line'
        },
        style: {
            fg: 'white',
            border: {
                fg: '#f0f0f0'
            }
        }
    });
    
    screen.append(chatBox);
    screen.append(userlist);
    screen.append(chatInput);
    screen.append(typingDisplay);
    screen.render();
    function printNick(user) {
        let unick = user.nick;
	if (!unick) return "{red-fg}[Error]{/red-fg}"
        if (unick.length > 20) {
            unick = unick.substring(0, 20) + "...";
        }
        let color = parseColor(user.color.replace(/;(.*)|\/\*(.*)\*\//g, "").trim());
        return `{${color}-fg}${unick}{/${color}-fg}`.replace(/(<([^>]+)>)/ig, '');
    }
    function printMsg(msg, parseMsg = true, escapeMsg = true) {
        if (!msg.msg) return;
        let date = new Date(msg.date);
        let color = parseColor(msg.color.replace(/;(.*)|\/\*(.*)\*\//g, "").trim());
        let message = parseMsg ? susMessageParse(msg.msg, username) : msg.msg;
        if (escapeMsg) message = blessed.escape(message);
        chatBox.insertBottom(`{bold}${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}{/bold} {${color}-fg}${msg.nick.padEnd(20, " ").replace(/(<([^>]+)>)/ig, '')}{/${color}-fg}${he.decode(message.replace(/(<([^>]+)>)/ig, ''))}`);
        chatBox.scrollTo(chatBox.getScrollHeight())
        screen.render();
        
    }

    function inputLoop() {
        chatInput.focus();
        chatInput.readInput(function(err, value) {
            if (err) {
                return console.error(err);
            }
            if (value === '/quit') {
                return process.exit(0);
            }
            if (value === "/clear") {
                chatBox.setContent("");
                chatInput.clearValue();
                chatInput.focus();
                screen.render();
                return inputLoop()
            }
            socket.send(value)
            chatInput.clearValue();
            chatInput.focus();
            screen.render();
            inputLoop()
        });
    }
    socket.on('message', (msg) => {
        // message schema:
        /*
            {
                "nick": "hello",
                "msg": "message here",
                "color": "red",
                "home": "fr8fu t8ft u98mfut",
                "date": 1600023940
            }
        */
       /*let date = new Date(msg.date);
       let color = parseColor(msg.color.replace(/;(.*)|\/\*(.*)\*\//g, "").trim());
       chatBox.insertBottom(`{bold}${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}{/bold} {${color}-fg}${msg.nick.padEnd(20, " ").replace(/(<([^>]+)>)/ig, '')}{/${color}-fg}${susMessageParse(msg.msg).replace(/(<([^>]+)>)/ig, '')}`);
       chatBox.scrollTo(chatBox.getScrollHeight())
       screen.render();*/
       printMsg(msg);
    })
    socket.on('user joined', (user) => {
        //userlist.add(`{bold}${user.nick.replace(/(<([^>]+)>)/ig, '')}{/bold}`);
        /*let date = new Date();
        let ducknick = "→";
        let color = parseColor(user.color.replace(/;(.*)|\/\*(.*)\*\//g, "").trim());
        let duckmsg = `{${color}-fg}${susMessageParse(user.nick)}{/${color}-fg} has joined the chat!`;
        chatBox.insertBottom(`{bold}${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}{/bold} {green-fg}${ducknick.padEnd(20, " ").replace(/(<([^>]+)>)/ig, '')}{/green-fg}${duckmsg.replace(/(<([^>]+)>)/ig, '')}`);
        chatBox.scrollTo(chatBox.getScrollHeight())
        screen.render();*/
        printMsg({
            nick: '→',
            msg: `${printNick(user)} has joined the chat!`,
            color: 'green',
            date: Date.now()
        }, false, false);
        
    })
    socket.on('user left', (user) => {
        //userlist.add(`{bold}${user.nick.replace(/(<([^>]+)>)/ig, '')}{/bold}`);
        
        printMsg({
            nick: '←',
            msg: `${printNick(user)} has left the chat.`,
            color: 'red',
            date: Date.now()
        }, false, false);
        
    })
    
    socket.on('update users', (users) => {
        userlist.clearItems();
        for (let sid in users) {
            let user = users[sid];
            let color = parseColor(user.color.replace(/;(.*)|\/\*(.*)\*\//g, "").trim());
            userlist.add(printNick(user));

        }
        screen.render();
    })
    socket.on('typing', (usersTyping) => {
        if (usersTyping.length === 0) {
            typingDisplay.setContent("");
            screen.render();
            return;
        }
        typingDisplay.setContent(usersTyping.map(user => printNick(user)).join(', ') + ' is typing...');
        screen.render();
    })
    inputLoop();
}