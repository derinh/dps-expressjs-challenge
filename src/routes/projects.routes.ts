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

//POST to create a new project
router.post('/', (req, res) => {
	try {
		const { id, name, description } = req.body;

		if (!id || !name || !description) {
			return res.status(400).json({ error: 'Missing required fieldss' });
		}

		db.run(
			'INSERT INTO projects (id, name, description) VALUES (@id, @name, @description)',
			{ id, name, description },
		);

		res.status(201).json({ message: 'Project created successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ erro: 'Failed to create project' });
	}
});

//DELETE
router.delete('/:id', (req, res) => {
	try {
		const { id } = req.params;

		const result = db.run('DELETE FROM projects WHERE id = @id', { id });

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Project not found' });
		}

		res.json({ message: `Project ${id} deleted successfully` });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete project' });
	}
});

//PUT
router.put('/:id', (req, res) => {
	try {
		const { id } = req.params;
		const { name, description } = req.body;

		if (!name || !description) {
			return res
				.status(400)
				.json({ error: 'Name and description are required' });
		}

		const result = db.run(
			'UPDATE projects SET name = @name, description = @description WHERE id = @id',
			{ id, name, description },
		);

		if (result.changes === 0) {
			return res.status(404).json({ error: 'Project not found' });
		}

		res.json({ message: `Project ${id} updated successfully` });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to update project' });
	}
});

//GET one single project
router.get('/:id', (req, res) => {
	try {
		const { id } = req.params;

		const results = db.query('SELECT * FROM projects WHERE id = @id', {
			id,
		});

		if (results.length === 0) {
			return res.status(404).json({ erro: 'Project not found' });
		}

		res.json(results[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to fetch project' });
	}
});

export default router;
