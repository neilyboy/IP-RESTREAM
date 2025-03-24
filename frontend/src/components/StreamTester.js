import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  PlayArrow, 
  Check, 
  Error, 
  Videocam, 
  Speed, 
  AudioFile, 
  HelpOutline, 
  Add as AddIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const StreamTester = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [streamInfo, setStreamInfo] = useState(null);

  const handleTest = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    setTesting(true);
    setError('');
    setResult(null);
    setStreamInfo(null);
    
    try {
      const response = await axios.post('/api/test-stream', { url });
      
      setResult({
        success: true,
        message: response.data.message || 'Stream is valid and accessible'
      });
      
      // Store stream info if available
      if (response.data.streamInfo) {
        setStreamInfo(response.data.streamInfo);
      }
      
      // If successful, trigger callback after a short delay
      setTimeout(() => {
        if (onSuccess && false) { 
          onSuccess(url);
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to test stream. Please check the URL and try again.');
      setResult({
        success: false,
        message: 'Stream test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    
    // Reset state when closing
    setTimeout(() => {
      setUrl('');
      setResult(null);
      setError('');
      setStreamInfo(null);
    }, 300);
  };

  const handleUseUrl = () => {
    if (onSuccess) {
      onSuccess(url);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTest();
    }
  };

  const renderStreamInfo = () => {
    if (!streamInfo) return null;
    
    return (
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, fontWeight: 600, mb: 1 }}>
          Stream Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontWeight: 500 }}>
              Resolution:
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
              {streamInfo.width}x{streamInfo.height} ({streamInfo.resolution})
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontWeight: 500 }}>
              Codec:
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
              {streamInfo.codec || 'Unknown'}
            </Typography>
          </Grid>
          
          {streamInfo.bitrate && (
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontWeight: 500 }}>
                Bitrate:
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                {streamInfo.bitrate} Kbps
              </Typography>
            </Grid>
          )}
          
          {streamInfo.frameRate && (
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: theme.palette.text.disabled, fontWeight: 500 }}>
                Frame Rate:
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                {streamInfo.frameRate} fps
              </Typography>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUseUrl}
            startIcon={<AddIcon />}
          >
            Use This Stream
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={!testing ? handleClose : undefined}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          borderRadius: '12px',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Test Stream URL
        </Typography>
        <Button 
          variant="outlined" 
          color="inherit" 
          size="small"
          onClick={handleClose}
          disabled={testing}
          sx={{ 
            borderColor: theme.palette.divider,
            '&:hover': {
              borderColor: theme.palette.divider,
            }
          }}
        >
          Close
        </Button>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2, 
          p: 2, 
          backgroundColor: theme.palette.background.paper, 
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
        }}>
          <HelpOutline sx={{ color: theme.palette.text.secondary, mr: 2 }} />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            This tool validates if a stream URL is accessible and can be used for restreaming. 
            Enter a stream URL (RTMP, RTSP, HLS, etc.) below and click "Test Stream" to check its validity.
          </Typography>
        </Box>
        
        <TextField
          autoFocus
          label="Stream URL"
          fullWidth
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={testing}
          margin="normal"
          placeholder="rtmp://example.com/live/stream"
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
              '& fieldset': {
                borderColor: theme.palette.divider,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.divider,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.divider,
              },
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary,
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary,
              '&::placeholder': {
                color: theme.palette.text.disabled,
                opacity: 1,
              },
            },
            '& .MuiFormHelperText-root': {
              color: theme.palette.text.secondary,
            },
          }}
          helperText="Example formats: rtmp://, rtsp://, http://, https:// (HLS)"
        />
        
        {!url && !testing && !result && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: theme.palette.background.paper, 
            borderRadius: '8px',
            border: `1px dashed ${theme.palette.divider}`,
            mb: 2
          }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Example URLs to test:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                  https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: 'monospace' }}>
                  rtmp://live.example.com/live/stream
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        
        {testing && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} gutterBottom>
              Testing stream, please wait...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={50} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography 
              variant="body2" 
              sx={{ color: theme.palette.text.secondary, mt: 1 }} 
              align="right"
            >
              50%
            </Typography>
          </Box>
        )}
        
        {result && (
          <Paper 
            elevation={3} 
            sx={{ 
              mt: 3, 
              p: 2, 
              background: result.success ? theme.palette.background.paper : theme.palette.background.default,
              border: `1px solid ${result.success ? theme.palette.divider : theme.palette.error.main}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2
            }}
          >
            {result.success ? (
              <Check sx={{ color: theme.palette.success.main }} />
            ) : (
              <Error sx={{ color: theme.palette.error.main }} />
            )}
            <Box>
              <Typography variant="subtitle1" sx={{ color: result.success ? theme.palette.success.main : theme.palette.error.main, fontWeight: 600 }}>
                {result.success ? 'Stream Test Successful' : 'Stream Test Failed'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                {result.message}
              </Typography>
              {error && (
                <Typography variant="body2" sx={{ color: theme.palette.error.main, mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  Error: {error}
                </Typography>
              )}
            </Box>
          </Paper>
        )}
        
        {renderStreamInfo()}
        
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        {result && (
          <Button 
            onClick={() => {
              setUrl('');
              setResult(null);
              setError('');
              setStreamInfo(null);
            }}
            color="inherit"
            sx={{ color: theme.palette.text.secondary }}
          >
            Test Another URL
          </Button>
        )}
        <Button 
          onClick={handleTest}
          variant="contained"
          color="primary"
          disabled={!url.trim() || testing}
          startIcon={testing ? <CircularProgress size={20} /> : <PlayArrow />}
        >
          {testing ? 'Testing...' : 'Test Stream'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StreamTester;