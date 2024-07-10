import { Box, Chip } from '@mui/material';

const UsernameButton = ({ username }) => {

    return (

        <>
           <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1000 }}>
            {username && (
              <Chip
                label={username}
                color="secondary"
                sx={{
                  height: '28px',
                  borderRadius: '14px',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  '& .MuiChip-label': {
                    px: 2,
                  },
                }}
              />
            )}
          </Box>
        </>


    )
};

export default UsernameButton;