import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Checkbox, FormControlLabel, Button, Modal } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const AddClientModal = ({ open, onClose, onAddClient }) => {
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientAddress, setNewClientAddress] = useState('');
    const [newClientDob, setNewClientDob] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [dobError, setDobError] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        const allFieldsFilled = newClientName.trim() !== '' &&
                                newClientPhone.trim() !== '' &&
                                newClientAddress.trim() !== '' &&
                                newClientDob !== null;
        setIsFormValid(allFieldsFilled && termsAccepted);

        if (formSubmitted) {
            validateForm();
        }
    }, [newClientName, newClientPhone, newClientAddress, newClientDob, termsAccepted, formSubmitted]);

    const validateForm = () => {
        let isValid = true;

        if (!newClientName.trim()) {
            setNameError('Name is required');
            isValid = false;
        } else {
            setNameError('');
        }

        if (!newClientPhone.trim()) {
            setPhoneError('Phone number is required');
            isValid = false;
        } else if (!/^\d+$/.test(newClientPhone)) {
            setPhoneError('Phone number must contain only digits');
            isValid = false;
        } else {
            setPhoneError('');
        }

        if (!newClientAddress.trim()) {
            setAddressError('Address is required');
            isValid = false;
        } else {
            setAddressError('');
        }

        if (!newClientDob) {
            setDobError('Date of Birth is required');
            isValid = false;
        } else {
            const today = dayjs();
            if (newClientDob.isAfter(today)) {
                setDobError('Date of Birth cannot be in the future');
                isValid = false;
            } else {
                setDobError('');
            }
        }

        return isValid;
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
    };

    const handlePhoneChange = (e) => {
        const onlyNums = e.target.value.replace(/[^\d]/g, '');
        setNewClientPhone(onlyNums);
    };

    const handleDateChange = (newDate) => {
        setNewClientDob(newDate);
    };

    const handleAddClient = () => {
        setFormSubmitted(true);
        const isValid = validateForm();
        if (isValid && termsAccepted) {
            onAddClient({
                name: newClientName,
                phone: newClientPhone,
                address: newClientAddress,
                dob: newClientDob.format('DD/MM/YYYY')
            });
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="add-client-modal"
            aria-describedby="modal-to-add-new-client"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Add New Client
                </Typography>
                <TextField
                    fullWidth
                    label="Name"
                    value={newClientName}
                    onChange={handleInputChange(setNewClientName)}
                    error={formSubmitted && !!nameError}
                    helperText={formSubmitted && nameError}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Phone"
                    value={newClientPhone}
                    onChange={handlePhoneChange}
                    error={formSubmitted && !!phoneError}
                    helperText={formSubmitted && phoneError}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Address"
                    value={newClientAddress}
                    onChange={handleInputChange(setNewClientAddress)}
                    error={formSubmitted && !!addressError}
                    helperText={formSubmitted && addressError}
                    sx={{ mb: 2 }}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Date of Birth"
                        value={newClientDob}
                        onChange={handleDateChange}
                        format="DD/MM/YYYY"
                        renderInput={(params) => 
                            <TextField 
                                {...params} 
                                fullWidth 
                                error={formSubmitted && !!dobError}
                                helperText={formSubmitted && dobError}
                                sx={{ mb: 2 }}
                            />
                        }
                    />
                </LocalizationProvider>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                        />
                    }
                    label="Signed the terms and conditions?"
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={handleAddClient}
                    disabled={!isFormValid}
                    fullWidth
                >
                    Add Client
                </Button>
            </Box>
        </Modal>
    );
};

export default AddClientModal;