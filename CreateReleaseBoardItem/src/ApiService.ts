import * as rm from 'typed-rest-client/RestClient'
import btoa = require('btoa');

export class Api {
    private static _instance: Api;
    private _apiService: ApiService | undefined;

    private constructor() {}

    public static get instance() {
        if (!this._instance)
            this._instance = new Api();

        return this._instance;
    }

    public initialize(projectUrl: string, teamUrl: string, accessToken: string) {
        this._apiService = new ApiService(projectUrl, teamUrl, accessToken);
    }

    public async get<T>(url: string): Promise<T | null> {
        if (!this._apiService)
            throw new Error("Must initialize api service first");

        return await this._apiService.get(url);
    }

    public async post<T>(url: string, body: object, options?: object | undefined): Promise<T | null> {
        if (!this._apiService)
            throw new Error("Must initialize api service first");

        return await this._apiService.post(url, body, options);
    }
}

export class ApiService {

    private httpClient: rm.RestClient; 

    constructor(projectUrl: string, teamUrl: string, accessToken: string) {
        this.httpClient = new rm.RestClient(null, `${projectUrl}/${teamUrl}/`, undefined, { headers: { 'Authorization': 'Basic ' + btoa(":" + accessToken)}});
    }

    public async get<T>(url: string): Promise<T | null> {
        const result = await this.httpClient.get(url);

        return result.statusCode == 200
            ? result.result as T
            : null;
    }

    public async post<T>(url: string, body: object, additionalOptions?: object | undefined): Promise<T | null> {
        const options = additionalOptions ? additionalOptions as rm.IRequestOptions : undefined;
        const result = await this.httpClient.create(url, body, options);

        return result.statusCode == 200 || result.statusCode == 201
            ? result.result as T
            : null;
    }
}