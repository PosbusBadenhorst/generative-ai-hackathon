export default function isUserAuth (req, res, next) {
    console.log('req.user', req.user)
    if (req.user) {
        return next()
    }
    return res.redirect('/login')
}