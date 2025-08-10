    import { useState, FC } from 'react';
    import {
        Box,
        TextField,
        Button,
    } from '@mui/material';
    import axios from 'axios';

    // Define the allowed integration types
    type IntegrationType = 'Notion' | 'Airtable' | 'HubSpot';

    // Define the props for the DataForm component
    interface DataFormProps {
        integrationType: IntegrationType | null;
        credentials?: any; // Can be more specific if the shape of credentials is known
    }

    // Map the integration type to the backend endpoint slug
    const endpointMapping: Record<IntegrationType, string> = {
        'Notion': 'notion',
        'Airtable': 'airtable',
        'HubSpot': 'hubspot',
    };

    export const DataForm: FC<DataFormProps> = ({ integrationType, credentials }) => {
        // State to hold the data loaded from the integration
        const [loadedData, setLoadedData] = useState<any>(null);

        const handleLoad = async () => {
            if (!integrationType) {
                alert("Please select an integration type first.");
                return;
            }

            const endpoint = endpointMapping[integrationType];

            try {
                const formData = new FormData();
                formData.append('credentials', JSON.stringify(credentials));
                const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
                const data = response.data;
                setLoadedData(JSON.stringify(data, null, 2)); // Pretty-print JSON
            } catch (e: any) {
                alert(e?.response?.data?.detail || 'Failed to load data.');
            }
        }

        return (
            <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
                <Box display='flex' flexDirection='column' width='100%'>
                    <TextField
                        label="Loaded Data"
                        value={loadedData || ''}
                        sx={{mt: 2}}
                        InputLabelProps={{ shrink: true }}
                        multiline
                        rows={10}
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <Button
                        onClick={handleLoad}
                        sx={{mt: 2}}
                        variant='contained'
                        disabled={!integrationType || !credentials}
                    >
                        Load Data
                    </Button>
                    <Button
                        onClick={() => setLoadedData(null)}
                        sx={{mt: 1}}
                        variant='contained'
                        color="secondary"
                    >
                        Clear Data
                    </Button>
                </Box>
            </Box>
        );
    }
