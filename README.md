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
```
const username = "name@company.com";
const apikey = "xxxxxx-xxx-xxxx-xxxx-xxxxxx";
const projectId = "xxxxxx-xxx-xxxx-xxxx-xxxxxx";
const projectName = "MyAwesomeProject";
const revNo = -1; // -1 for latest
const branchName = null; // null for mainline
const originalWidgetId = "OldWidget.widget.OldWidget";
const newWidgetId = "NewWidget.widget.NewWidget";

const dryRun = false; // can run without committing
```

Run script:

`> npm start`
