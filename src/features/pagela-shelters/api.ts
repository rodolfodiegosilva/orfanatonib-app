import api from '@/config/axiosConfig';
import type {
  SheltersResponse,
  ShelteredResponse,
  PagelasResponse,
  SheltersFilters,
  ShelteredFilters,
  PagelasFilters,
} from './types';

export class PagelaSheltersApi {
  // Endpoint 1: GET /shelters
  static async getShelters(filters: SheltersFilters = {}): Promise<SheltersResponse> {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 5, // Padronizado para 5 itens
      sort: filters.sort || 'name',
      order: filters.order || 'ASC',
      searchString: filters.searchString || '',
      nameSearchString: filters.nameSearchString || '',
      leaderId: filters.leaderId || '',
    };

    const response = await api.get('/shelters', { params });
    return response.data;
  }

  // Endpoint 2: GET /sheltered
  static async getSheltered(filters: ShelteredFilters = {}): Promise<ShelteredResponse> {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 5, // Padronizado para 5 itens
      orderBy: filters.orderBy || 'name',
      order: filters.order || 'ASC',
      searchString: filters.searchString || '',
      shelterId: filters.shelterId || '',
      shelterName: filters.shelterName || '',
      city: filters.city || '',
      state: filters.state || '',
      gender: filters.gender || '',
      birthDate: filters.birthDate || '',
      birthDateFrom: filters.birthDateFrom || '',
      birthDateTo: filters.birthDateTo || '',
      joinedAt: filters.joinedAt || '',
      joinedFrom: filters.joinedFrom || '',
      joinedTo: filters.joinedTo || '',
    };

    const response = await api.get('/sheltered', { params });
    return response.data;
  }

  // Endpoint 3: GET /pagelas/paginated
  static async getPagelas(filters: PagelasFilters = {}): Promise<PagelasResponse> {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 5, // Padronizado para 5 itens
      searchString: filters.searchString || '',
      shelteredId: filters.shelteredId || '',
      year: filters.year || '',
      visit: filters.visit || '',
      present: filters.present !== undefined ? filters.present : '',
    };

    const response = await api.get('/pagelas/paginated', { params });
    return response.data;
  }
}
