export type CreateTenantFormValues = {
    tenant: {
        name: string;
        address: string;
        contact_phone: string;
        contact_email: string;
    };
    admin: {
        full_name: string;
        email: string;
        phone_number: string;
        password: string;
    };
};