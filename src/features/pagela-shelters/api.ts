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
    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 10, // Shelters: 10 itens
      sort: filters.sort || 'name',
      order: filters.order || 'ASC',
    };

    // Só adiciona parâmetros se tiverem valores
    if (filters.searchString && filters.searchString.trim()) {
      params.searchString = filters.searchString;
    }
    if (filters.nameSearchString && filters.nameSearchString.trim()) {
      params.nameSearchString = filters.nameSearchString;
    }
    if (filters.leaderId && filters.leaderId.trim()) {
      params.leaderId = filters.leaderId;
    }

    const response = await api.get('/shelters', { params });
    return response.data;
  }

  // Endpoint 2: GET /sheltered
  static async getSheltered(filters: ShelteredFilters = {}): Promise<ShelteredResponse> {
    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 20, // Sheltered: 20 itens
      orderBy: filters.orderBy || 'name',
      order: filters.order || 'ASC',
    };

    // Só adiciona parâmetros se tiverem valores
    if (filters.searchString && filters.searchString.trim()) {
      params.searchString = filters.searchString;
    }
    if (filters.shelterId && filters.shelterId.trim()) {
      params.shelterId = filters.shelterId;
    }
    if (filters.shelterName && filters.shelterName.trim()) {
      params.shelterName = filters.shelterName;
    }
    if (filters.city && filters.city.trim()) {
      params.city = filters.city;
    }
    if (filters.state && filters.state.trim()) {
      params.state = filters.state;
    }
    if (filters.gender && filters.gender.trim()) {
      params.gender = filters.gender;
    }
    if (filters.birthDate && filters.birthDate.trim()) {
      params.birthDate = filters.birthDate;
    }
    if (filters.birthDateFrom && filters.birthDateFrom.trim()) {
      params.birthDateFrom = filters.birthDateFrom;
    }
    if (filters.birthDateTo && filters.birthDateTo.trim()) {
      params.birthDateTo = filters.birthDateTo;
    }
    if (filters.joinedAt && filters.joinedAt.trim()) {
      params.joinedAt = filters.joinedAt;
    }
    if (filters.joinedFrom && filters.joinedFrom.trim()) {
      params.joinedFrom = filters.joinedFrom;
    }
    if (filters.joinedTo && filters.joinedTo.trim()) {
      params.joinedTo = filters.joinedTo;
    }
    if (filters.shelteredName && filters.shelteredName.trim()) {
      params.shelteredName = filters.shelteredName;
    }

    const response = await api.get('/sheltered', { params });
    return response.data;
  }

  // Endpoint 3: GET /pagelas/paginated
  static async getPagelas(filters: PagelasFilters = {}): Promise<PagelasResponse> {
    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 5, // Pagelas: 5 itens
    };

    // Só adiciona parâmetros se tiverem valores
    if (filters.searchString && filters.searchString.trim()) {
      params.searchString = filters.searchString;
    }
    if (filters.shelteredId && filters.shelteredId.trim()) {
      params.shelteredId = filters.shelteredId;
    }
    if (filters.year !== undefined && filters.year !== null) {
      params.year = filters.year;
    }
    if (filters.visit !== undefined && filters.visit !== null) {
      params.visit = filters.visit;
    }
    if (filters.present !== undefined) {
      params.present = filters.present;
    }

    const response = await api.get('/pagelas/paginated', { params });
    return response.data;
  }
}
