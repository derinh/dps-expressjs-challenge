import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
	res.json({ message: 'All projects go here' });
});

export default router;
