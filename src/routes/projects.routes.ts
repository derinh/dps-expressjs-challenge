import { Router } from 'express';
import db from '../services/db.service';

const router = Router();

//GET all projects
router.get('/', (req, res) => {
	try {
		const projects = db.query('SELECT * FROM projects');
		res.json(projects);
	} catch (err) {
		res.status(500).json({ error: 'Something went wrong' });
	}
});

export default router;
