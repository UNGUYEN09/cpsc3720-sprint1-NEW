const express = require("express");
const router = express.Router();
const { parseInput, bookTickets, getEvents } = require("./llmService");

// --- LLM ROUTES ---
router.post("/parse", async (req, res) => {
  try {
    const result = await parseInput(req.body.query);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/confirm", async (req, res) => {
  const { event, tickets } = req.body;
  if (!event || !tickets)
    return res.status(400).json({ error: "Missing event or tickets." });

  try {
    const booking = await bookTickets(event, tickets);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EVENT ROUTES ---
// GET all Events
router.get("/Events", async (req, res) => {
  try {
    const Events = await getEvents();
    res.json(Events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PURCHASE TICKETS BY EVENT ID
router.post("/Events/:id/purchase", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const quantity = req.body.quantity;

    const Events = await getEvents();
    const event = Events.find((e) => e.id === id);

    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.ticketsAvailable < quantity)
      return res.status(400).json({ error: "Not enough tickets" });

    const newAmount = event.ticketsAvailable - quantity;
    const sqlite3 = require("sqlite3").verbose();
    const db = new sqlite3.Database(
      require("path").join(__dirname, "../shared-db/database.sqlite")
    );

    db.run(
      "UPDATE Events SET ticketsAvailable = ? WHERE id = ?",
      [newAmount, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          message: `Purchased ${quantity} ticket(s) for ${event.name}`,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
