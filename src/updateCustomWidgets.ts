import { Branch, MendixSdkClient, OnlineWorkingCopy, Project, Revision } from "mendixplatformsdk";
import { customwidgets, pages } from "mendixmodelsdk";
import when = require("when");

// ---------------------------------------------------- //
// SETTINGS                                             //
// ---------------------------------------------------- //
const username = "name@company.com";
const apikey = "xxxxxx-xxx-xxxx-xxxx-xxxxxx";
const projectId = "xxxxxx-xxx-xxxx-xxxx-xxxxxx";
const projectName = "MyAwesomeProject";
const revNo = -1; // -1 for latest
const branchName = null; // null for mainline
const originalWidgetId = "OldWidget.widget.OldWidget";
const newWidgetId = "NewWidget.widget.NewWidget";

const dryRun = false; // can run without committing

// ---------------------------------------------------- //

let matchCount = 0;

const revision = revNo === -1 ? "latest" : revNo;
const branch = branchName === null ? "mainline" : branchName;
const message = `widget ${originalWidgetId} by ${newWidgetId} in project ${projectName} - ${branch} Rev: ${revision}`;
console.log((dryRun ? "DRY RUN " : "REPLACE ") + message);

const client = new MendixSdkClient(username, apikey);
const project: Project = new Project(client, projectId, projectName);

client.platform().createOnlineWorkingCopy(project, new Revision(revNo, new Branch(project, branchName)))
    .then(workingCopy => findAndUpdateWidgetId(workingCopy))
    .then(workingCopy => {
        if (!dryRun) {
            workingCopy.commit();
        }
    })
    .done(
        () => console.log(dryRun ? "Done" : "Done. Check the result in the Mendix Business Modeler."),
        (error: any) => {
            console.log("Something went wrong:");
            console.dir(error);
        }
    );

function findAndUpdateWidgetId(workingCopy: OnlineWorkingCopy): when.Promise<OnlineWorkingCopy> {
    console.log("Finding widgets...");

    return when.promise<pages.IPage[]>(resolve => resolve(workingCopy.model().allPages()))
        .then(allPages => loadAllPages(allPages))
        .then(pages => findCustomWidgetInAllPages(pages))
        .then((AllCustomWidgets: any) => loadAllWidgets(AllCustomWidgets))
        .then(customWidgets => updateWidgets(customWidgets))
        .then(() => console.log(dryRun ? `Found ${matchCount} widgets` : `Update ${matchCount} widget ids.`))
        .then(() => workingCopy);
}

function updateWidgets(widgets: customwidgets.CustomWidget[]): when.Promise<customwidgets.CustomWidget[]> {
    console.log(dryRun ? "Finding widgets IDs" : "Updating widgets IDs");
    return when.promise<customwidgets.CustomWidget[]> (resolve => {
        const widgetsUpdate: customwidgets.CustomWidget[] = [];
        widgets.forEach(widget => {
            if (widget.type && widget.type.widgetId === originalWidgetId) {
                widgetsUpdate.push(widget);
                matchCount++;
                if (dryRun) {
                    console.log(`Found widget ${widget.type.widgetId} ${widget.id}`);
                } else {
                    console.log(`Update widget ${widget.type.widgetId} ${widget.id}`);
                    widget.type.widgetId = newWidgetId;
                }
            }
        });
        resolve(widgetsUpdate);
    });
}

function loadAllPages(pages: pages.IPage[]): when.Promise<pages.Page[]> {
    console.log("Loading all pages");
    return when.all<pages.Page[]>(pages.map(loadPage));
}

function loadPage(page: pages.IPage): when.Promise<pages.Page> {
    return when.promise<pages.Page>((resolve, reject) => {
        if (page) {
            page.load(pageInstance => {
                if (pageInstance) {
                    resolve(pageInstance);
                } else {
                    console.log(`Failed to load page: ${page.qualifiedName}`);
                    reject(`Failed to load page: ${page.qualifiedName}`);
                }
            });
        } else {
            reject(`'page' is undefined`);
        }
    });
}

function findCustomWidgetInAllPages(pages: pages.Page[]): when.Promise<customwidgets.CustomWidget[]> {
    console.log("Find all custom widgets");
    return when.map<customwidgets.CustomWidget[]>(pages, findCustomWidgets);
}

function findCustomWidgets(page: pages.Page): when.Promise<customwidgets.CustomWidget[]> {
    return when.promise<customwidgets.CustomWidget[]>((resolve) => {
        const widgetList: customwidgets.CustomWidget[] = [];
        page.traverse((structure) => {
            // console.log(structure);
            if (structure instanceof pages.Widget && structure.structureTypeName === "CustomWidgets$CustomWidget") {
                widgetList.push(structure as customwidgets.CustomWidget);
                // console.log("should have pushed structure", structure );
            }
        });
        resolve(widgetList);
    });
}

function loadAllWidgets(pagesWidgets: [customwidgets.CustomWidget[]]): when.Promise<customwidgets.CustomWidget[]> {
    console.log("Load all custom widgets");
    let widgetList: customwidgets.CustomWidget[] = [];
    pagesWidgets.forEach((widgets) => {
        widgetList = widgetList.concat(widgets);
    });
    return when.map<customwidgets.CustomWidget[]>(widgetList, loadWidget);
}

function loadWidget(widget: customwidgets.CustomWidget): when.Promise<customwidgets.CustomWidget> {
    return when.promise<customwidgets.CustomWidget>((resolve, reject) => {
        if (widget) {
            widget.load(widgetInstance => {
                if (widgetInstance) {
                    resolve(widgetInstance);
                } else {
                    console.log(`Failed to load: ${widget.name}`);
                    reject(`Failed to load: ${widget.name}`);
                }
            });
        } else {
            reject(`'widget' is undefined`);
        }
    });
}
