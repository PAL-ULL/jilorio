const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg', "Usuario no autenticado")
    res.redirect('/login');
}

helpers.authRole = (role) => {
    return (req, res, next) => {
        
        if (req.user.rol !== role){
            res.status(401);
            return res.send("Not alowed");
        }
        next();
    }
}

helpers.authRoleMultiple = (roles) => {
    return (req, res, next) => {
        let counter = 0;
        console.log("Roles: " + roles)
        for (let i= 0; i < roles.length; i++){
            if (req.user.rol === roles[i]){
                counter++;
            }
        }
       if (counter>0){
        next();
       
       }else{
        res.status(401);
        return res.send("Not alowed");
       }
        
    }
}


module.exports = helpers;