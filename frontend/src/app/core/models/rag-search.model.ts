export interface RAGSearchResult {
    _id: string;
    nombre: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    ciudad: string;
    category: string;
    slug: string;
    price: number;
    image?: string[];
    stock: number;
    relevanceScore: number;
    relevancePercentage: number;
    note?: string;
}

export interface RAGSearchResponse {
    success: boolean;
    query: string;
    summary: {
        message: string;
        categories?: string[];
        cities?: string[];
        priceRange?: {
            min: number;
            max: number;
        };
        suggestion?: string;
    };
    results: RAGSearchResult[];
    meta: {
        totalFound: number;
        searchType: 'textual' | 'semantica';
        timestamp: string;
    };
}

export interface IntelligentAutocomplete {
    success: boolean;
    query: string;
    suggestions: {
        type: 'event';
        nombre: string;
        ciudad: string;
        category: string;
        slug: string;
        image?: string;
        price: number;
    }[];
    suggestedQueries?: {
        type: 'query';
        text: string;
        icon: string;
    }[];
}