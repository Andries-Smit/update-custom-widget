# Update custom widget
EXPERIMENTAL Update Mendix Custom widget, widgetId

For demo purposes only. 
No warrantees nor support is provided for this script.

## Features
* Update all occurrence of custom widgets with a give ID, update the ID to a new one.
* Dry run, without commit.

## Limitations
* Can only update the widget ID, no conversion of properties

## Install
`> npm install`

## Usage
Set your settings
* Create a file `localSettings.js` copy contents of `localSettings.example.js` and fillin the placeholders accordingly
```
exports.settings = {
    username : "your-mendix-user-email@your-domain",
    apikey : "your-mendix-account-api-key",
    projectId : "your-mendix-project-AppId",
    projectName : "your-mendix-project-Name",
    originalWidgetId : "OldWidget.widget.OldWidget",
    newWidgetId : "NewWidget.widget.NewWidget",
    // optional already set as default.
    revNo: -1, // -1 for latest
    branchName: "", // "" for mainline
    dryRun: false // can run without committing
};
```

Run script:

`> npm start`
