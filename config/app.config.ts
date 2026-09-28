export type AuthMode = 'token' | 'ui';

export interface AppTimeouts {
  readonly navigation: number;
  readonly action: number;
  readonly expect: number;
  readonly navigateExpect: number;
  readonly pipelineDiagram: number;
  readonly apiRouteFetch: number;
  readonly configurationDeployment: number;
}

export interface AppConfigType {
  readonly environment: string;
  readonly baseURL: string;
  readonly apiUrl: string;
  readonly authMode: AuthMode;
  readonly credentials: {
    readonly email: string;
    readonly password: string;
  };
  readonly authUrl: string;
  readonly clientId: string;
  readonly grantType: string;
  readonly dataplaneId?: string;
  readonly configuredDataPlaneOption?: string;
  readonly replayTargetOption?: string;
  readonly replayDestinationOption?: string;
  readonly replaySourceOption?: string;
  readonly tenantFeaturesPath: string;
  readonly timeouts: AppTimeouts;
}

export const AppConfig: AppConfigType = {
  get environment(): string {
    return process.env['ENVIRONMENT'] ?? 'qa';
  },
  get baseURL(): string {
    return process.env['BASE_URL'] ?? 'http://localhost:3000';
  },
  get apiUrl(): string {
    return process.env['API_URL'] ?? '';
  },
  get authMode(): AuthMode {
    return process.env['AUTH_MODE'] === 'ui' ? 'ui' : 'token';
  },
  credentials: {
    get email(): string {
      return process.env['AUTH_USERNAME'] ?? process.env['USER_EMAIL'] ?? '';
    },
    get password(): string {
      return process.env['AUTH_PASSWORD'] ?? process.env['USER_PASSWORD'] ?? '';
    },
  },
  get authUrl(): string {
    return process.env['AUTH_URL'] ?? '';
  },
  get clientId(): string {
    return process.env['CLIENT_ID'] || 'web-pkce';
  },
  get grantType(): string {
    return process.env['GRANT_TYPE'] || 'password';
  },
  ...(process.env['DATAPLANE_ID'] ? { dataplaneId: process.env['DATAPLANE_ID'] } : {}),
  ...(process.env['DATA_PLANE_OPTION']
    ? { configuredDataPlaneOption: process.env['DATA_PLANE_OPTION'] }
    : {}),
  ...(process.env['REPLAY_TARGET_OPTION']
    ? { replayTargetOption: process.env['REPLAY_TARGET_OPTION'] }
    : {}),
  ...(process.env['REPLAY_DESTINATION_OPTION']
    ? { replayDestinationOption: process.env['REPLAY_DESTINATION_OPTION'] }
    : {}),
  ...(process.env['REPLAY_SOURCE_OPTION']
    ? { replaySourceOption: process.env['REPLAY_SOURCE_OPTION'] }
    : {}),
  tenantFeaturesPath: '/v2/tenant/features',
  timeouts: {
    navigation: 30_000,
    action: 15_000,
    expect: 20_000,
    navigateExpect: 40_000,
    pipelineDiagram: 60_000,
    apiRouteFetch: 60_000,
    configurationDeployment: 600_000,
  },
};
