import React, { useState } from 'react';
import { Typography, Button, Grid, Alert, Box, Paper, Chip, Modal, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { styled } from '@mui/material/styles';
import { submitMinutes } from '../utils/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const MinuteButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(0.5),
    '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
        borderColor: theme.palette.action.disabledBackground,
    },
}));

const ModalContent = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
}));

const TanningSession = ({ selectedClient, clients, onClientsUpdate }) => {
    const [minutes, setMinutes] = useState(0);
    const [alert, setAlert] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [sunbedType, setSunbedType] = useState('');

    const handleSubmitSession = async () => {
        if (minutes > 0) {
            setOpenModal(true);
        } else {
            setAlert({ severity: 'error', message: 'Please select a valid number of minutes.' });
        }
    };

    const handleConfirmSession = async () => {
        if (minutes > 0 && sunbedType) {
            try {
                await submitMinutes(selectedClient, minutes, sunbedType);
                setMinutes(0);
                setSunbedType('');
                onClientsUpdate();
                setAlert({ severity: 'success', message: `Session of ${minutes} minutes on ${sunbedType} sunbed submitted successfully.` });
            } catch (error) {
                console.error('Failed to submit session:', error);
                setAlert({ severity: 'error', message: 'Failed to submit session.' });
            }
        } else {
            setAlert({ severity: 'error', message: 'Please select a sunbed type.' });
        }
        setOpenModal(false);
    };

    const sessionOptions = [3, 6, 9, 12, 15, 18, 21];
    const client = clients.find(c => c.id === selectedClient);

    return (
        <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom>
                Tanning Session for {client?.name}
            </Typography>
            <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                    Session Minutes:
                </Typography>
                <Chip
                    label={minutes}
                    color="primary"
                    size="large"
                    sx={{ fontSize: '1.2rem', fontWeight: 'bold', mb: 2 }}
                />
            </Box>
            <Grid container spacing={1} mb={2}>
                {sessionOptions.map(option => (
                    <Grid item key={option}>
                        <MinuteButton
                            variant={minutes === option ? 'contained' : 'outlined'}
                            onClick={() => setMinutes(option)}
                            disabled={option > client?.remainingMinutes}
                        >
                            {option} min
                        </MinuteButton>
                    </Grid>
                ))}
            </Grid>
            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitSession}
                disabled={minutes === 0}
                fullWidth
            >
                Submit Session
            </Button>

            {alert && (
                <Alert severity={alert.severity} sx={{ mt: 2 }}>
                    {alert.message}
                </Alert>
            )}

            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
            >
                <ModalContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Confirm Your Tanning Session
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        You're about to start a {minutes}-minute tanning session.
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                        Please select your preferred sunbed type:
                    </Typography>
                    <RadioGroup
                        value={sunbedType}
                        onChange={(e) => setSunbedType(e.target.value)}
                    >
                        <FormControlLabel value="lie-down" control={<Radio />} label="Lie-down Sunbed" />
                        <FormControlLabel value="stand-up" control={<Radio />} label="Stand-up Sunbed" />
                    </RadioGroup>
                    <Box mt={3}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleConfirmSession}
                            disabled={!sunbedType}
                            fullWidth
                        >
                            Start Session
                        </Button>
                    </Box>
                </ModalContent>
            </Modal>
        </StyledPaper>
    );
};

export default TanningSession;

