const mailog = require('../src/index.js')
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
});

mailog.info("Hello, World!", true)
// if you want to send mail, set second parameter to true
mailog.error("Hello, World!", true)
mailog.warn("Hello, World!", true)
mailog.debug("Hello, World!", true)