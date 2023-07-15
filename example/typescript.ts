import * as mailog from '../src/index';

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
    port: 5002, // if you want to use web part, you must set this value.
    auth: {
        id: 'admin',
        pass: 'admin'
    }
});

mailog.info("This is info message", true);
// If you set the second parameter to true, the message will be sent to the email address you set.
mailog.warn("This is warn message", true);
mailog.error("This is error message", true);
mailog.debug("This is debug message", true);