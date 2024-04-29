import { Api } from "./ApiService";
import { UrlHelper } from "./helpers/UrlHelper";
import { linkedPullRequestModel, gitPullRequestQuery, PullRequest, PullRequestLabelResponse, PullRequestWorkItemResponse } from "./models/linkedPullRequestModels";

export class PullRequestHelper {

    public static async getPullRequestLinkedToCommit(commitId: string, repositoryName: string): Promise<linkedPullRequestModel | null> {
        const body = {
            "queries": [{
                "type": "lastMergeCommit",
                "items": [
                    commitId
                ]
            }]
        };

        const response = await Api.instance.post<gitPullRequestQuery>(UrlHelper.urlRelatedPR(repositoryName), body);
        if (!response || response.results.length === 0)
            return null;

        for(let i of response.results) {
            if (commitId in i) {
                const commit = i[commitId];
                if (commit.length > 0) {
                    return {
                        id: commit[0].pullRequestId,
                        repositoryUrl: commit[0].repository.url
                    } as linkedPullRequestModel;
                }
            }
        }

        return null;
    }

    public static async getArtifactId(id: number): Promise<string | null> {
        const response = await Api.instance.get<PullRequest>(UrlHelper.urlPr(id));
        return response?.artifactId ?? null;
    }

    public static async getLabels(repositoryUrl: string, id: number): Promise<string | null> {
        const response = await Api.instance.get<PullRequestLabelResponse>(UrlHelper.urlPrLabels(repositoryUrl, id));
        if (!response || response.value.length === 0 || response.value.every(l => !l.active))
            return null;

        return response.value.filter(l => l.active).map(l => l.name).join('; ');
    }

    public static async getWorkItems(repositoryUrl: string, id: number): Promise<WorkItem[] | null> {
        const response = await Api.instance.get<PullRequestWorkItemResponse>(UrlHelper.urlPrWorkItems(repositoryUrl, id));
        if (!response || response.value.length === 0)
            return null;

        const workItems: WorkItem[] = [];
        for(let i of response.value) {
            const workItem = await Api.instance.get<WorkItem>(`${i.url}?$expand=relations`);
            if (!workItem)
                continue;
            
            switch (workItem.fields['System.WorkItemType']) {
                case 'User Story':
                case 'Bug':
                    workItems.push(workItem);
                    break;
                case 'Task':
                    const parentRelation = workItem.relations.find(r => r.rel === 'System.LinkTypes.Hierarchy-Reverse');
                    if (!parentRelation)
                        continue;

                    const parent = await Api.instance.get<WorkItem>(parentRelation.url);
                    if (parent)
                        workItems.push(parent);
                    break;
                default:
                    continue;
            }
        }

        return [...new Set(workItems)];
    }
}

export interface WorkItem {
    id: number,
    fields: WorkItemFields;
    url: string;
    relations: WorkItemRelation[];
}

interface WorkItemFields {
    'System.WorkItemType': string;
    'System.AreaPath': string;
    'System.IterationPath': string;
}

interface WorkItemRelation {
    rel: string;
    url: string;
}