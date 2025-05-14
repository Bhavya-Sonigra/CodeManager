const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const problemRoutes = require('./routes/problemRoutes');
const codeRoutes = require('./routes/codeRoutes');
const validate = require('./middleware/validate');

const app = express();

// Middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/problems', validate, problemRoutes);
app.use('/api', validate, codeRoutes); // Code execution routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
