import api from './api';
import { Grant } from '@/types';

export const grantsService = {
    discover: async (params: { keyword?: string; sector?: string; amount?: number }) => {
        const { data } = await api.get<Grant[]>('/api/grants/discover', { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<Grant>(`/api/grants/${id}`);
        return data;
    },

    checkEligibility: async (grantId: string, orgId: string) => {
        const { data } = await api.post('/api/grants/check-eligibility', { grantId, orgId });
        return data;
    },
};

export const narrativeService = {
    generate: async (grantId: string, section: string, tone: string) => {
        const { data } = await api.post('/api/narrative/generate', { grantId, section, tone });
        return data;
    },
};

export const complianceService = {
    check: async (applicationId: string) => {
        const { data } = await api.post('/api/compliance/check', { applicationId });
        return data;
    },
};

export const organizationService = {
    save: async (orgData: Record<string, unknown>) => {
        const { data } = await api.post('/api/org/save', orgData);
        return data;
    },
};

export const reviewService = {
    simulate: async (applicationId: string) => {
        const { data } = await api.post('/api/review/simulate', { applicationId });
        return data;
    },
};

export const dashboardService = {
    getStats: async () => {
        const { data } = await api.get('/api/dashboard/stats');
        return data;
    },
};

export const auditService = {
    getLog: async () => {
        const { data } = await api.get('/api/audit/log');
        return data;
    },
};
