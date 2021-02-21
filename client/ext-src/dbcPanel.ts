 
import { readFileSync } from "fs";
import { join } from "path";
import { ViewColumn, WebviewPanel, window, Uri } from "vscode";
import { Message } from "vscode-languageclient";
import { Database } from "../../server/out/dbc/db.js"
import { reviver } from "../../server/out/mapTools.js";

export default class DBCPanel{
    private static readonly viewType = 'angular';
    private panel: WebviewPanel;
    private curDb: Database | null;
    private extensionPath: string;

    public constructor(extensionPath: string){
        this.extensionPath = join(extensionPath, 'client');

        this.panel = window.createWebviewPanel(
            'dbcPreview',
            'DBC Preview',
            ViewColumn.Beside,
            {
                // enable javascript in the webview
                enableScripts: true,


            }
        );
        
        this.panel.onDidDispose(this.cleanup.bind(this));
        this.curDb = null;
        this.panel.webview.html = this.genContent();
    }

    // public getPanel(){
    //     return this.panel;
    // }


    public cleanup(){
        // ?
    }

    private genContent(){
        const appDistPath = join(this.extensionPath, 'dist');
        const appDistPathUri = Uri.file(appDistPath);

        const baseUri = this.panel.webview.asWebviewUri(appDistPathUri);
        const indexPath = join(appDistPath, 'index.html');
        var indexHtml = readFileSync(indexPath, {encoding: 'utf8'});
        indexHtml = indexHtml.replace('<base href="/">', `<base href="${String(baseUri)}/">`);
        
        return indexHtml;
    }

    private header(){
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DBC Preview</title>
        </head>
        <body>
        `;
    }

    public parsedDBC(received: string){
        this.curDb = JSON.parse(received, reviver);
        // this.panel.webview.html = this.genContent();
    }

    private footer(){
        return `
        </body>
        </html>`;
    }
}
