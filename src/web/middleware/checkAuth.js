export default (
    function (req, res, next) {
        req.user ? next() : res.redirect('/login')
    }
)