import { Router } from 'express';
import db from '../services/db.service';

const router = Router();

interface Report {
	id: string;
	text: string;
	project_id: string;
}

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
			'INSERT INTO reports (id, text, project_id) VALUES (@id, @text, @project_id)',
			{ id, text, project_id },
		);

		res.status(201).json({ message: 'Report created successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to create report' });
	}
});

//GET a specific report
router.get('/:id', (req, res) => {
	try {
		const { id } = req.params;

		const results = db.query('SELECT * FROM reports WHERE id = @id', {
			id,
		});

		if (results.length === 0) {
			return res.status(404).json({ error: 'Report not found' });
		}

		res.json(results[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch report' });
	}
});

//PUT to update report
router.put('/:id', (req, res) => {
	try {
		const { id } = req.params;
		const { text, project_id } = req.body;

		if (!text || !project_id) {
			return res
				.status(400)
				.json({ error: 'Text and project_id are required' });
		}

		// Optional: Check if the target project exists
		const projectExists = db.query(
			'SELECT 1 FROM projects WHERE id = @id',
			{ id: project_id },
		);
		if (projectExists.length === 0) {
			return res.status(400).json({ error: 'Project does not exist' });
		}

		const result = db.run(
			'UPDATE reports SET text = @text, project_id = @project_id WHERE id = @id',
			{ id, text, project_id },
		);

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Report not found' });
		}

		res.json({ message: `Report ${id} updated successfully` });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to update report' });
	}
});

//special endpoint
router.get('/special', (req, res) => {
	try {
		const reports = db.query('SELECT * FROM reports') as Report[];

		const qualifyingReports = reports.filter((report) => {
			const wordCounts: { [word: string]: number } = {};

			const words = report.text
				.toLowerCase()
				.replace(/[^\w\s]/g, '')
				.split(/\s+/);

			for (const word of words) {
				if (!word) continue;
				wordCounts[word] = (wordCounts[word] || 0) + 1;
			}

			return Object.values(wordCounts).some((count) => count >= 3);
		});
		res.json(qualifyingReports);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to process reports' });
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
