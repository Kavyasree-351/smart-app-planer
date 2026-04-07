require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ── Event Schema ──────────────────────────────────────────────
const eventSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  dt:     { type: Date,   required: true },
  cat:    { type: String, default: 'personal' },
  userId: { type: String, default: 'default_user' }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ── AI Chat Route (single prompt) ─────────────────────────────
// Used by askGrok() in the frontend
app.post('/api/chat', async (req, res) => {
  try {
    const { message, system, history = [], max_tokens = 600 } = req.body;

    // Build messages array
    const messages = [];
    if (history.length > 0) {
      messages.push(...history);
    }
    if (message) {
      messages.push({ role: 'user', content: message });
    }

    const payload = {
      model: 'grok-2-1212',
      max_tokens,
      messages
    };

    if (system) {
      payload.messages = [{ role: 'system', content: system }, ...messages];
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('xAI error:', response.status, errBody);
      return res.status(response.status).json({ error: { message: `xAI API error: ${response.status}` } });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: { message: 'AI Service Unavailable' } });
  }
});

// ── AI Chat Messages Route (multi-turn with optional web search) ──
// Used by callGrok() in the frontend (Insights, daily brief, etc.)
app.post('/api/chat-messages', async (req, res) => {
  try {
    const { messages, max_tokens = 600, useWebSearch = false } = req.body;

    const payload = {
      model: useWebSearch ? 'grok-2-1212' : 'grok-2-1212',
      max_tokens,
      messages
    };

    // Enable live search if requested (Grok supports search_parameters)
    if (useWebSearch) {
      payload.search_parameters = { mode: 'auto' };
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('xAI error:', response.status, errBody);
      return res.status(response.status).json({ error: { message: `xAI API error: ${response.status}` } });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('chat-messages route error:', error);
    res.status(500).json({ error: { message: 'AI Service Unavailable' } });
  }
});

// ── Events CRUD ───────────────────────────────────────────────

// GET all events (sorted by date)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({ userId: 'default_user' }).sort({ dt: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST create a new event
app.post('/api/events', async (req, res) => {
  try {
    const { title, dt, cat } = req.body;
    if (!title || !dt) return res.status(400).json({ error: 'title and dt are required' });

    const newEvent = new Event({ title, dt, cat, userId: 'default_user' });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save event' });
  }
});

// PUT update an event
app.put('/api/events/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Event not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE an event
app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NEXUS backend running → http://localhost:${PORT}`);
  console.log(` Health check        → http://localhost:${PORT}/health`);
});
