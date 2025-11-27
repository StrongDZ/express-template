export class HttpsService {
    private baseUrl: string;
    private apiKey?: string;

    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.apiKey = apiKey;
    }

    public async request(path: string, method: string = "GET", body?: any, query?: Record<string, any>): Promise<any> {
        let url = `${this.baseUrl}${path.startsWith("/") ? path : "/" + path}`;

        if (query) {
            const params = new URLSearchParams();
            Object.entries(query).forEach(([key, value]) => {
                if (value != null) {
                    params.append(key, String(value));
                }
            });
            url += "?" + params.toString();
        }

        const headers: Record<string, string> = {};
        if (this.apiKey) {
            headers["Authorization"] = `Bearer ${this.apiKey}`;
        }
        if (body) {
            headers["content-type"] = "application/json";
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();
    }

    public async batchRequest(
        requests: Array<{ path: string; method?: string; body?: any; query?: Record<string, any> }>
    ): Promise<Array<{ success: boolean; data?: any; error?: string }>> {
        const results = await Promise.all(
            requests.map(async (req) => {
                try {
                    const data = await this.request(req.path, req.method || "GET", req.body, req.query);
                    return { success: true, data };
                } catch (error: any) {
                    return { success: false, error: error.message };
                }
            })
        );
        return results;
    }
}
