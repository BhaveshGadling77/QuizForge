
function authenticateToken(req, res, next) {    
    const token = req.headers['authorization']

    if (!token) {
        return res.json(401).json({error : "Access Token Missing"})
    }

    const actualToken = token.split(' ')[1]
    
    // try {
    //     const decoded = jwt. 
    // }
}


export {authenticateToken}