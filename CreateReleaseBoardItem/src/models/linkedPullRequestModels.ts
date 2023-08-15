export interface gitPullRequestQuery {
    results: { [key: string]: gitPullRequestQueryResult[]}[];
}

export interface gitPullRequestQueryResult {
    pullRequestId: number;
    repository: gitPullRequesetQueryRepositoryResult;
}

export interface gitPullRequesetQueryRepositoryResult {
    url: string;
}

export interface PullRequest {
    artifactId: string;
}

export interface linkedPullRequestModel {
    id: number;
    repositoryUrl: string;
}

export interface PullRequestLabelResponse {
    value: PullRequestLabel[];
}

export interface PullRequestLabel {
    active: boolean;
    name: string;
}

export interface PullRequestWorkItemResponse {
    value: PullRequestWorkItem[];
}

export interface PullRequestWorkItem {
    id: string;
    url: string;
}