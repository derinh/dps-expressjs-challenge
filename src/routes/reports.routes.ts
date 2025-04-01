import { Router } from 'express';
import db from '../services/db.service';

const router = Router();

//GET all reports
router.get('/', (req, res) => {
	try {
		const reports = db.query('SELECT * FROM reports');
		res.json(reports);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch reports' });
	}
});

export default router;
