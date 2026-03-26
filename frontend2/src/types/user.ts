
export interface LoginResponse {
    email: string;
    role: string;
    name: string;
    access_token: string;
    token_type: string;
    message: string;
}

export interface BookshopUser {
    id: string;
    email: string;
    phone_number: string;
    full_name?: string;
    user_role: string;
    tenant_id: string;
}

export interface CreateBookshopUserInput {
    email: string;
    phone_number: string;
    full_name: string;
    password: string;
    user_role: string;
}

export interface ResetBookshopUserPasswordInput {
    user_id: string;
    new_password: string;
}
