from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


# turns a plain text password into a hashed password. Plain text passwords are a cautionary tail.
def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)
