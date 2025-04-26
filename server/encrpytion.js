import bcrypt from 'bcrypt';

export async function encrypt(password)
{
    const saltRounds=  10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password,salt);
    return hashedPassword;
}

export async function verifyEncryption(password, hash)
{
    if(await bcrypt.compare(password, hash))
        {
            return true
        }
    return false;
}

