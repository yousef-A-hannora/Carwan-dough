export const authorizedOnly = (req,res,next)=>{
    if (req.isAuthenticated()) return next()
    return res.redirect("/login")
}

export const adminOnly = (req,res,next)=>{
    if (req.isAuthenticated() && req.user.role === "ADMIN") return next()
    return res.status(401).send({"msg":"Only Admins can access"})
}