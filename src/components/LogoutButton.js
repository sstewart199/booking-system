import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation } from 'react-router-dom';
import { IconButton } from '@mui/material';

const LogoutButton = ({ handleLogout }) => {
    const location = useLocation();  // Get the current URL path

    return (

        <>
            {location.pathname !== '/login' && <IconButton
                onClick={handleLogout}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                }}
            >
                <LogoutIcon />
            </IconButton>}
        </>


    )
};

export default LogoutButton;