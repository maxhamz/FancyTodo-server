const bcrypt = require("bcryptjs")
const salt = bcrypt.genSaltSync(10)

function hashPassword(inputted) {
    console.log("--- HELPERS: HASHING PASSWORD ---");
    console.log("INPUTTED IS");
    console.log(inputted);
    let hashed = bcrypt.hashSync(inputted, salt)
    console.log("HASHED IS");
    console.log(hashed+"\n");
    return hashed
}


function checkPassword(inputted, stored) {
    console.log("--- HELPERS: CHECKING PASSWORD ---");
    console.log("INPUTTED IS");
    console.log(inputted);
    console.log("STORED IS");
    console.log(stored);
    let flag = bcrypt.compareSync(inputted, stored)
    console.log(`FLAG RESULT IS: ${flag} \n`);
    return flag
}

module.exports = {
    hashPassword,
    checkPassword
}