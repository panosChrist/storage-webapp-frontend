import { UserManager } from 'oidc-client-ts';

const settings = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: window.location.origin,
};

const userManager = new UserManager(settings);

export const login = () => {
    return userManager.signinRedirect();
};

export const logout = () => {
    return userManager.signoutRedirect();
};

export const handleLoginCallback = () => {
    return userManager.signinRedirectCallback();
};

export const getUser = () => {
    return userManager.getUser();
};

export const getAccessToken = async () => {
    const user = await userManager.getUser();
    return user?.access_token;
};
