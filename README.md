# Mailog

[`Mailog`](https://mailog.juany.kr) is useful Logging module.

This module lets you log events simply and can get logs by E-Mail and Website.
By using Mailog into your project, You won't be worry about event log of your services.

## Install

    $ npm install mailog

## Usage

#### Initalize Module

You need to initalize module before logging.
Init Function requires `log` and `web` Objects.
First, You should write information related to your mail account in the log section.
Second, You should write authenication data into the web section.

Your input will be encrypted via `bcrypt` and `base64`.

Example:

    const mailog = require('mailog');
    // import * as mailog from 'mailog';
    mailog.init({ // Log Part
        host: "smtp.hanmail.net",
        port: 465,
        svcName: "Your Service Name",
        useSecureConnection: true,
        auth: {
            id: "your id",
            pass: "your password"
        },
        sender: "your email",
        receiver: "your email",
        timeZone: "Asia/Seoul"
    }, { // Web Part
        use: true, // or false
        port: 5002, // if you want to use web part, set use to true and set port
        auth: {
            id: 'admin',
            pass: 'admin'
        }
    })

#### Log Event

Use `mailog.info` to log information level.
Mailog have 4 Log Level, `info`, `warn`, `error`, `debug`.

Example:

    const mailog = require('mailog');
    // import * as mailog from 'mailog';
    
    mailog.info("Hello World!", false); //false means don't mail this log.
    mailog.warn("Watch Out!", true);
    mailog.error("There is an error...", false);
    mailog.debug("Bezzzz. I'm bug!", true);

#### Check Logs on Web
Log web's default port is 5001.
you can acccess web logs at `http://your.domain:5001`

## Examples

If you need example file, you can get [examples](https://github.com/ninejuan/mailog/tree/production/example) here.

## Credits

  - [Juan Lee](https://juany.kr)

## License

[GNU GPL 3.0 License](https://www.gnu.org/licenses/gpl-3.0.html)