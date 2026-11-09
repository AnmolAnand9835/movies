import {
  getPersonById,
  getPersonCredits,
  getPersonExternalIds,
} from '../controllers/person.controller.js';

const personRoutes = (app) => {
  app.get('/api/v1/people/:id', getPersonById);
  app.get('/api/v1/people/:id/credits', getPersonCredits);
  app.get('/api/v1/people/:id/external-ids', getPersonExternalIds);
};

export default personRoutes;
