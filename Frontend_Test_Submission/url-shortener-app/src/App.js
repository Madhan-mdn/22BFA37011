import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate
} from 'react-router-dom';

const MainApp = () => {
  const [urlData, setUrlData] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [validity, setValidity] = useState(30);
  const [shortcode, setShortcode] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('urlData') || '[]');
    setUrlData(stored);
  }, []);

  const handleShorten = () => {
    if (!urlInput || !urlInput.startsWith('http')) {
      alert('Invalid URL. Please enter a valid URL starting with http or https.');
      return;
    }

    const code = shortcode || uuidv4().slice(0, 6);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validity * 60000);

    const newEntry = {
      originalUrl: urlInput,
      shortUrl: `http://localhost:3000/${code}`,
      shortcode: code,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: []
    };

    const updated = [...urlData, newEntry];
    setUrlData(updated);
    localStorage.setItem('urlData', JSON.stringify(updated));

    const mappings = JSON.parse(localStorage.getItem("urlMappings") || "{}");
    mappings[code] = urlInput;
    localStorage.setItem("urlMappings", JSON.stringify(mappings));

    setUrlInput('');
    setValidity(30);
    setShortcode('');
  };

  const handleClick = (code) => {
    const now = new Date();
    const updated = urlData.map((entry) =>
      entry.shortcode === code
        ? {
            ...entry,
            clicks: [
              ...entry.clicks,
              {
                timestamp: now.toISOString(),
                source: 'localhost',
                location: 'India'
              }
            ]
          }
        : entry
    );
    setUrlData(updated);
    localStorage.setItem('urlData', JSON.stringify(updated));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 5,
        background: 'linear-gradient(to right, #e0f7fa, #fff)',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" gutterBottom align="center" color="primary">
          🔗 URL Shortener
        </Typography>

        {/* Form Card */}
        <Paper elevation={6} sx={{ p: 3, mb: 4, borderRadius: 4, backgroundColor: '#ffffffee' }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Enter your URL to generate a shortened version
          </Typography>
          <TextField
            label="Original URL"
            fullWidth
            margin="normal"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <TextField
            label="Validity (minutes)"
            type="number"
            fullWidth
            margin="normal"
            value={validity}
            onChange={(e) => setValidity(Number(e.target.value))}
          />
          <TextField
            label="Preferred Shortcode (optional)"
            fullWidth
            margin="normal"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
          />
          <Box textAlign="right" mt={2}>
            <Button variant="contained" color="primary" onClick={handleShorten}>
              Generate Short Link
            </Button>
          </Box>
        </Paper>

        {/* List of Links */}
        <Typography variant="h5" gutterBottom>Your Shortened Links</Typography>
        <Grid container spacing={3}>
          {Array.isArray(urlData) && urlData.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  backgroundColor: '#fefefe',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    backgroundColor: '#f0f8ff'
                  }
                }}
              >
                <Typography><strong>🔗 Original:</strong> {item.originalUrl}</Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>🚀 Shortened:</strong>{' '}
                  <a
                    href={`http://localhost:3000/${item.shortcode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(item.shortcode)}
                    style={{ color: '#1976d2', fontWeight: 'bold' }}
                  >
                    {item.shortUrl}
                  </a>
                </Typography>
                <Typography sx={{ mt: 1 }}><strong>⏳ Expires:</strong> {item.expiresAt}</Typography>
                <Typography sx={{ mt: 1 }}><strong>👀 Clicks:</strong> {item.clicks?.length || 0}</Typography>

                {Array.isArray(item.clicks) && item.clicks.length > 0 && (
                  <List dense>
                    {item.clicks.map((click, idx) => (
                      <ListItem key={idx} sx={{ pl: 0 }}>
                        <ListItemText
                          primary={`🕒 ${click.timestamp}`}
                          secondary={`📍 Source: ${click.source}, 🌍 Location: ${click.location}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const RedirectHandler = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const mappings = JSON.parse(localStorage.getItem("urlMappings") || "{}");
    const target = mappings[shortcode];
    if (target) {
      window.location.href = target;
    } else {
      alert("URL not found or expired");
      navigate("/");
    }
  }, [shortcode, navigate]);

  return null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/:shortcode" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
};

export default App;
