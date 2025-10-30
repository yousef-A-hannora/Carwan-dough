import bcrypt from "bcrypt"

const saltRounds = 10;

export const passHashing = (password)=>{
    const salt =  bcrypt.genSaltSync(saltRounds)
    const hash =  bcrypt.hashSync(password, salt)
    return hash
} 

export const compareHash = (plainPass, hashedPass)=>{ 
    return bcrypt.compareSync(plainPass,hashedPass)
}
