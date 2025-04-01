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

//POST to create a new report
router.post('/', (req, res) => {
	try {
		const { id, text, project_id } = req.body;

		if (!id || !text || !project_id) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const projectExists = db.query(
			'SELECT 1 FROM projects WHERE id = @id',
			{ id: project_id },
		);

		if (projectExists.length === 0) {
			return res.status(400).json({ error: 'Project does not exist' });
		}

		db.run(
			'INSERT INTO reports (id, text, projects_id) VALUES (@id, @text, @project_id)',
			{ id, text, project_id },
		);

		res.status(201).json({ message: 'Report created successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to create report' });
	}
});

//DELETE report
router.delete('/:id', (req, res) => {
	try {
		const { id } = req.params;

		const result = db.run('DELETE FROM reports WHERE id = @id', { id });

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Report not found' });
		}

		res.json({ message: `Report ${id} deleted successfully` });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete report' });
	}
});

export default router;
