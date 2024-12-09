## About
A very simple CJS script for connecting to Dlive stream chat.
In addition to messages, you can also catch "Follow", "Gift", "Host" and some other events.

## How to use
Since this is javascript, you need `nodejs` and `npm` installed.
Create a folder and copy <a href="https://github.com/Mikulskii/Odysee-simplest-chat-logger/blob/main/dlive_chat_logger.js">`dlive_chat_logger.js`</a> to it.<p>
Being inside the newly created directory, you need to install the `ws` package:<p> 
```
npm i ws
```

Insert the channel name in `const channel = ""`

Run with
```
node dlive_chat_logger.js
```
---
*The script does not provide a correct reconnect, it is recommended to use `pm2 manager`*
