export class UrlHelper {
    public static urlRelatedPR = (repositoryName: string) => `_apis/git/repositories/${repositoryName}/pullrequestquery?api-version=6.1-preview.1`;
    public static urlPr = (id: number) => `_apis/git/pullrequests/${id}?api-version=6.1-preview.1`;
    public static urlPrLabels = (repositoryUrl: string, id: number) => `${repositoryUrl}/pullRequests/${id}/labels`
    public static urlPrWorkItems = (repositoryUrl: string, id: number) => `${repositoryUrl}/pullRequests/${id}/workitems`;
    public static urlWorkItem = (type: string) => `_apis/wit/workitems/$${type}?api-version=7.0`
}