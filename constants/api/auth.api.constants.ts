export const AuthApiConstants = {
  token: {
    method: 'POST',
    path: '/protocol/openid-connect/token',
    pattern: /.*\/protocol\/openid-connect\/token.*/,
  },
  userInfo: {
    method: 'GET',
    path: '/protocol/openid-connect/userinfo',
    pattern: /.*\/protocol\/openid-connect\/userinfo.*/,
  },
  tenantFeatures: {
    method: 'GET',
    path: '/v2/tenant/features',
    pattern: /.*\/v2\/tenant\/features.*/,
  },
} as const;
