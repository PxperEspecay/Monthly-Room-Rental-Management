const jwt = require('jsonwebtoken');

exports.auth = async (req, res, next) => {
    try{

        // const token = req.headers["authtoken"]
        const token = req.headers["authorization"].replace("Bearer ", "")
        if (!token) {
            return res.status(401).send('No token')
        }
        const decoded = jwt.verify(token, 'jwtsecret')
        req.user = decoded

        // console.log(decoded,'TKTKTKTTK');
        next();
        




    }catch (err) {
        console.log(err);
        res.send('Token Invalid!!!').status(500)
    }
}