def authenticate_user(email: str, password: str):
    if email == "test@example.com" and password == "password123":
        return { "sub": "user_id_1", "email": email }
    return None