# Intro text

## Build steps
- Go to folder `CreateReleaseBoardItem/src`
- Run `npm install`
- Run `tsc`
- Update version in `task.json`
- Run `tfx extension create --manifest-globs vss-extension.json --rev-version` in root folder (or update version manually first with the `--rev-version`)
- Remove `src` folder from generated vsix file (as it's not neccesary)

## Example
```
- task: CreateReleaseBoardItem@0
  inputs:
    teamProject: 'evdb-dev'
    areaPath: 'evdb-dev\ReleaseBoard'
    iterationPath: 'evdb-dev'
    workItemType: 'User Story'
    title: 'Hello world'
    description: 'some description'
```

## Running locally
Use `$env:INPUT_{variableName}` to set an input variable