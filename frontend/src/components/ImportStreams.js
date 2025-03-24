import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const ImportStreams = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const [jsonData, setJsonData] = useState('');
  const [importMode, setImportMode] = useState('overwrite');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleTextChange = (e) => {
    setJsonData(e.target.value);
    // Clear file data if manually editing text
    if (e.target.value) {
      setFileContent(null);
      setFileName('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setFileContent(content);
      // Also show the content in the text area
      setJsonData(content);
    };
    reader.readAsText(file);
  };

  const handleModeChange = (e) => {
    setImportMode(e.target.value);
  };

  const validateJson = (json) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || !parsed.streams || typeof parsed.streams !== 'object') {
        return { valid: false, message: 'Invalid format. JSON must contain a streams object.' };
      }
      
      // Count streams
      const streamCount = Object.keys(parsed.streams).length;
      if (streamCount === 0) {
        return { valid: false, message: 'No streams found in the import data.' };
      }
      
      return { valid: true, data: parsed, count: streamCount };
    } catch (error) {
      return { valid: false, message: 'Invalid JSON format. Please check your input.' };
    }
  };

  const handleImport = async () => {
    // Use file content if available, otherwise use text input
    const dataToImport = fileContent || jsonData;
    
    const validation = validateJson(dataToImport);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/restore', {
        config: validation.data,
        mode: importMode
      });

      setLoading(false);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to import streams');
    }
  };

  const handleClose = () => {
    // Reset state
    setJsonData('');
    setImportMode('overwrite');
    setError('');
    setLoading(false);
    setFileContent(null);
    setFileName('');
    
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: '12px',
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>Import Streams</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          Import streams from a JSON file or paste JSON data directly.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ 
              borderColor: theme.palette.divider, 
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.divider,
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            Upload JSON File
            <input
              type="file"
              accept=".json"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
          {fileName && (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, ml: 2 }}>
              File selected: {fileName}
            </Typography>
          )}
        </Box>

        <TextField
          label="Paste JSON data"
          multiline
          rows={10}
          value={jsonData}
          onChange={handleTextChange}
          fullWidth
          variant="outlined"
          placeholder='{"streams": {...}}'
          sx={{ 
            mb: 3,
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
            },
          }}
        />

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ color: theme.palette.text.secondary }}>Import Mode</FormLabel>
          <RadioGroup
            row
            name="importMode"
            value={importMode}
            onChange={handleModeChange}
          >
            <FormControlLabel 
              value="overwrite" 
              control={<Radio sx={{ color: theme.palette.text.secondary, '&.Mui-checked': { color: theme.palette.primary.main } }} />} 
              label={
                <Box>
                  <Typography variant="body1">Overwrite</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Replace all existing streams with imported ones
                  </Typography>
                </Box>
              } 
              sx={{ color: theme.palette.text.primary }}
            />
            <FormControlLabel 
              value="append" 
              control={<Radio sx={{ color: theme.palette.text.secondary, '&.Mui-checked': { color: theme.palette.primary.main } }} />} 
              label={
                <Box>
                  <Typography variant="body1">Append</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Add to existing streams (skips duplicates)
                  </Typography>
                </Box>
              } 
              sx={{ color: theme.palette.text.primary }}
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          color="primary"
          variant="contained"
          disabled={loading || !jsonData.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportStreams;
