export interface IntegrationItem {
    id?: string;
    type?: string;
    directory: boolean;
    parent_path_or_name?: string;
    parent_id?: string;
    name?: string;
    creation_time?: string;
    last_modified_time?: string;
    url?: string;
    children?: string[];
    mime_type?: string;
    delta?: string;
    drive_id?: string;
    visibility?: boolean;
  }
  
  export interface OAuthCredentials {
    access_token: string;
  }
  
  export interface AuthorizeRequest {
    org_id: string;
    user_id: string;
  }
  
  export type IntegrationPlatform = 'hubspot' | 'notion' | 'airtable';
  
  export interface IntegrationConfig {
    name: string;
    displayName: string;
    color: string;
    icon: string;
    description: string;
  }