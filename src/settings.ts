import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";
import { FolderSuggest } from "../obsidian-reusables/src/FolderSuggest";

export type ChildVisualization = "top-bar" | "files-panel" | "none";

export const DEFAULT_SETTINGS: {
        inbox: string;
        childVisualization: ChildVisualization;
} = {
        inbox: "Uncategorized",
        childVisualization: "top-bar",
};
export class MainPluginSettingsTab extends PluginSettingTab {
	constructor(
		app: App,
		override plugin: Main,
	) {
		super(app, plugin);
		this.plugin = plugin;
	}

	suggest?: FolderSuggest;

	display() {
		const { containerEl } = this;
		containerEl.empty();
		const options = Object.fromEntries(
			this.app.vault.getAllFolders().map((v) => [v.path, v.path]),
		);
		options["/"] = "/";

		const setInbox = async (v: string) => {
			this.plugin.settings.inbox = v;
			await this.plugin.saveSettings();
		};

                new Setting(containerEl)
                        .setName("Inbox folder")
                        .setDesc("Folder where notes without explicit ftags are stored")
                        .addSearch((search) => {
                                search.setValue(this.plugin.settings.inbox).onChange(setInbox);
                                this.suggest = new FolderSuggest(this.app, search.inputEl);
                                this.suggest.onSelect((v) => setInbox(v.path));
                        });

                new Setting(containerEl)
                        .setName("Child visualisation")
                        .setDesc("Where to show virtual children of folder notes")
                        .addDropdown((dropdown) =>
                                dropdown
                                        .addOption("top-bar", "Top bar")
                                        .addOption("files-panel", "Files panel")
                                        .addOption("none", "None")
                                        .setValue(this.plugin.settings.childVisualization)
                                        .onChange(async (value) => {
                                                this.plugin.settings.childVisualization =
                                                        value as ChildVisualization;
                                                await this.plugin.saveSettings();
                                                this.plugin.injectChips();
                                        }),
                        );
        }
}
