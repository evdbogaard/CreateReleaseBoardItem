import tl = require('azure-pipelines-task-lib/task');

import { Api } from './ApiService';
import { PullRequestHelper } from './PullRequestService';
import { WorkItemBuilder, WorkItemFieldHelper } from './WorkItemBuilder';

async function run() {
    try {
        const collectionUrl = tl.getVariable('System.CollectionUri') ?? '<organization url: https://dev.azure.com/{orgName}/>';
        const accessToken = tl.getVariable('System.AccessToken') ?? '<access token>';
        const repositoryName = tl.getVariable('Build.Repository.Name') ?? "<repository name>";
        const gitCommitId = tl.getVariable('Build.SourceVersion') ?? "<git commit ID>";
        const buildId = tl.getVariable('Build.BuildId') ?? '<build ID>';

        // input variables
        const teamProject = tl.getInputRequired('teamProject');
        const title = tl.getInputRequired('title');
        const workItemType = tl.getInputRequired('workItemType');
        const areaPath = tl.getInputRequired('areaPath');
        const iterationPath = tl.getInputRequired('iterationPath');
        const description = tl.getInput('description') ?? '';
        const additionalTags = tl.getInput('additionalTags') ?? '';
        const customFieldMappings = tl.getDelimitedInput('customFieldMappings', '\n', false);

        Api.instance.initialize(collectionUrl, teamProject, accessToken);

        let prArtifactId: string | null = null;
        let labels: string | null = null;
        let workItems: string[] | null = null;

        const linkedPR = await PullRequestHelper.getPullRequestLinkedToCommit(gitCommitId, repositoryName);
        if (linkedPR) {
            prArtifactId = await PullRequestHelper.getArtifactId(linkedPR.id);
            labels = await PullRequestHelper.getLabels(linkedPR.repositoryUrl, linkedPR.id);
            if (additionalTags !== '') {
                labels = labels ? `${labels}; ${additionalTags}` : additionalTags;
            }
            workItems = await PullRequestHelper.getWorkItems(linkedPR.repositoryUrl, linkedPR.id);
        }

        const builder = new WorkItemBuilder();
        builder.addField(WorkItemFieldHelper.titleField, title);
        builder.addField(WorkItemFieldHelper.areaPathField, areaPath);
        builder.addField(WorkItemFieldHelper.iterationPath, iterationPath);
        builder.addField(WorkItemFieldHelper.descriptionField, description);
        builder.addRelation('Build', `vstfs:///Build/Build/${buildId}`, 'ArtifactLink');
        customFieldMappings.forEach(field => {
            const split = field.split('=');
            if (split.length != 2)
                return;

            builder.addField(`/fields/${split[0]}`, split[1]);
        })

        if (labels)
            builder.addField(WorkItemFieldHelper.tagPath, labels);

        if (prArtifactId)
            builder.addRelation('Pull Request', prArtifactId, 'ArtifactLink');

        if (workItems && workItems.length > 0) {
            for(let i of workItems) {
                builder.addRelation('Related', i, 'System.LinkTypes.Related');
            }
        }

        await builder.createWorkItem(workItemType);
    }
    catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();