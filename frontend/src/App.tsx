import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { shortenUrl, getUrlStats } from "./api";

function App() {
  const [url, setUrl] = useState("");
  const [validity, setValidity] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [statsCode, setStatsCode] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const handleShorten = async () => {
    setError(null);
    setShortLink("");
    try {
      const data = {
        url,
        validity: validity ? Number(validity) : undefined,
        shortcode: shortcode || undefined,
      };
      const response = await shortenUrl(data);
      setShortLink(response.shortLink);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleGetStats = async () => {
    setStatsError(null);
    setStats(null);
    try {
      const data = await getUrlStats(statsCode);
      setStats(data);
    } catch (err: any) {
      setStatsError(err.response?.data?.error || err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Create Short URL</Typography>
        <TextField
          label="Original URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Validity (minutes, default 30)"
          value={validity}
          onChange={(e) => setValidity(e.target.value)}
          type="number"
          fullWidth
          margin="normal"
        />
        <TextField
          label="Custom Shortcode (optional)"
          value={shortcode}
          onChange={(e) => setShortcode(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleShorten}>
          Shorten URL
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {shortLink && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Short URL: <a href={shortLink} target="_blank" rel="noopener noreferrer">{shortLink}</a>
          </Alert>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Get URL Stats</Typography>
        <TextField
          label="Shortcode"
          value={statsCode}
          onChange={(e) => setStatsCode(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleGetStats}>
          Get Stats
        </Button>
        {statsError && <Alert severity="error" sx={{ mt: 2 }}>{statsError}</Alert>}
        {stats && (
          <Box sx={{ mt: 2 }}>
            <Typography>Original URL: {stats.originalUrl}</Typography>
            <Typography>Created At: {new Date(stats.createdAt).toLocaleString()}</Typography>
            <Typography>Expiry: {new Date(stats.expiry).toLocaleString()}</Typography>
            <Typography>Total Clicks: {stats.totalClicks}</Typography>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Referrer</TableCell>
                    <TableCell>Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.clicks.map((click: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{click.referrer || "-"}</TableCell>
                      <TableCell>{click.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
