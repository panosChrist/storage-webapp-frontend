// src/javascript/authService.js
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

/**
 * Standard OIDC redirect login
 */
export const login = (extraParams = {}) => {
    if (Object.keys(extraParams).length > 0) {
        return userManager.signinRedirect({ extraQueryParams: extraParams });
    }
    return userManager.signinRedirect();
};

/**
 * Trigger Standard Username & Password Login Flow
 */
export const loginWithPassword = () => {
    const passwordFlow = import.meta.env.VITE_AUTHENTIK_PASSWORD_FLOW;
    if (passwordFlow) {
        return userManager.signinRedirect({
            extraQueryParams: { flow: passwordFlow }
        });
    }
    return userManager.signinRedirect();
};

/**
 * Trigger Passkey / WebAuthn Passwordless Login Flow
 */
export const loginWithPasskey = (customFlow) => {
    const passkeyFlow = customFlow || import.meta.env.VITE_AUTHENTIK_PASSKEY_FLOW || 'default-passwordless-flow';
    return userManager.signinRedirect({
        extraQueryParams: { flow: passkeyFlow }
    });
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

/**
 * Helper to check if browser supports WebAuthn / Passkeys
 */
export const isPasskeySupported = () => {
    return typeof window !== 'undefined' && 
           window.PublicKeyCredential !== undefined &&
           typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
};
