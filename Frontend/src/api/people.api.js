import { apiRequest } from './client';

export const getPerson = ({ id, signal } = {}) =>
  apiRequest(`/people/${id}`, { signal }).then((payload) => payload?.data ?? null);

export const getPersonCredits = ({ id, signal } = {}) =>
  apiRequest(`/people/${id}/credits`, { signal }).then((payload) => payload?.data ?? null);
