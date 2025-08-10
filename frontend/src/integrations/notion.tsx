import { useState, useEffect, FC } from 'react';
import {
    Box,
    Button,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

// Define the shape of the integration parameters
interface IntegrationParams {
    credentials?: any; // Can be more specific if the shape is known
    type?: 'Airtable' | 'Notion' | 'HubSpot';
}

// Define the types for the component's props
interface NotionIntegrationProps {
    user: string;
    org: string;
    integrationParams: IntegrationParams | null;
    setIntegrationParams: React.Dispatch<React.SetStateAction<IntegrationParams | null>>;
}

export const NotionIntegration: FC<NotionIntegrationProps> = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);

    // Function to open OAuth in a new window
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            // Expecting the response data to be a string (the auth URL)
            const response = await axios.post<string>(`http://localhost:8000/integrations/notion/authorize`, formData);
            const authURL = response.data;

            if (authURL) {
                const newWindow = window.open(authURL, 'Notion Authorization', 'width=600, height=600');

                // Polling for the window to close
                const pollTimer = window.setInterval(() => {
                    if (newWindow?.closed) { 
                        window.clearInterval(pollTimer);
                        handleWindowClosed();
                    }
                }, 200);
            }
        } catch (e: any) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail || 'An unknown error occurred.');
        }
    }

    // Function to handle logic when the OAuth window closes
    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axios.post(`http://localhost:8000/integrations/notion/credentials`, formData);
            const credentials = response.data; 

            if (credentials) {
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'Notion' }));
            }
        } catch (e: any) {
            alert(e?.response?.data?.detail || 'Failed to fetch credentials.');
        } finally {
            setIsConnecting(false);
        }
    }

    useEffect(() => {
        // Check if credentials for any integration exist
        setIsConnected(!!integrationParams?.credentials);
    }, [integrationParams]);

    return (
        <>
            <Box sx={{mt: 2}}>
                Parameters
                <Box display='flex' alignItems='center' justifyContent='center' sx={{mt: 2}}>
                    <Button 
                        variant='contained' 
                        onClick={isConnected ? () => {} : handleConnectClick}
                        color={isConnected ? 'success' : 'primary'}
                        disabled={isConnecting}
                        style={{
                            pointerEvents: isConnected ? 'none' : 'auto',
                            cursor: isConnected ? 'default' : 'pointer',
                        }}
                    >
                        {isConnected ? 'Notion Connected' : isConnecting ? <CircularProgress size={20} color="inherit" /> : 'Connect to Notion'}
                    </Button>
                </Box>
            </Box>
        </>
    );
}
