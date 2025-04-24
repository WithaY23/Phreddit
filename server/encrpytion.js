export async function encryptPassword(password)
{
    const saltRounds=  10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}

export async function verifyPassword(password, hash)
{
    if(await bcrypt.compare(password, hash))
        {
            return true
        }
    return false;
}

