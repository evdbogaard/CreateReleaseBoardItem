import { Api } from "./ApiService";
import { UrlHelper } from "./helpers/UrlHelper";

export class WorkItemBuilder {
    private _createObject: object[] = [];

    public addField(path: string, value: string) {
        this._createObject.push({
            "op": "add",
            "path": path,
            "value": value
        });
    }

    public addRelation(name: string, url: string, relation: string) {
        this._createObject.push({
            'op': 'add',
            'path': '/relations/-',
            'value': {
                'rel': relation,
                'url': url,
                'attributes': {
                    'name': name
                }
            }
        });
    }

    public async createWorkItem(type: string) {
        const options = { additionalHeaders: { 'Content-Type': 'application/json-patch+json'}};
        const result = await Api.instance.post(UrlHelper.urlWorkItem(type), this._createObject, options);

        if (result !== null)
            console.log('Succesfully created work item')
        else
            console.log('Failed to create work item');

        this._createObject = [];
    }
}

export class WorkItemFieldHelper {
    public static titleField: string = '/fields/System.Title';
    public static areaPathField: string = '/fields/System.AreaPath';
    public static iterationPath: string = '/fields/System.IterationPath';
    public static tagPath: string = '/fields/System.Tags';
    public static descriptionField: string = '/fields/System.Description';
}