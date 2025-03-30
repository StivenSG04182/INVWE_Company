import { useEffect, useState } from 'react';

interface Company {
    name: string;
    _id: string;
}

interface CompanyResponse {
    isValid: boolean;
    data?: {
        company: Company;
    };
    error?: string;
    isAdmin?: boolean;
    redirectUrl?: string;
}

export const useCompany = () => {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await fetch('/api/companies');
                const data: CompanyResponse = await response.json();

                if (data.isValid && data.data?.company) {
                    setCompany(data.data.company);
                } else if (data.error) {
                    setError(data.error);
                }
            } catch {
                setError('Error fetching company data');
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, []);

    return { company, loading, error };
};