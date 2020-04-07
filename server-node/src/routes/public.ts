import express from 'express';

const routes = express.Router();

routes.get('/test', async (req, res) => {
  return res.status(200).json('Hello World');
});

export default routes;
