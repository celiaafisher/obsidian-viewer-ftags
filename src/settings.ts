import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";

export type ChildrenDisplayMode = "off" | "limited" | "all";

export const DEFAULT_SETTINGS: {
	showChildren: ChildrenDisplayMode;
	defaultMoc: string;
} = {
	showChildren: "limited",
	defaultMoc: "",
};
export class MainPluginSettingsTab extends PluginSettingTab {
	constructor(
		app: App,
		override plugin: Main,
	) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Child chips")
			.setDesc("Display child notes under the tag chips")
			.addDropdown((dd) =>
				dd
					.addOptions({
						off: "Hidden",
						limited: "Up to 5",
						all: "All",
					})
					.setValue(this.plugin.settings.showChildren)
					.onChange(async (v) => {
						this.plugin.settings.showChildren =
							v as ChildrenDisplayMode;
						await this.plugin.saveSettings();
						this.plugin.injectChips();
					}),
			);

		new Setting(containerEl)
			.setName("Default MoC")
			.setDesc("MoC applied when last tag is removed")
			.addText((text) =>
				text
					.setPlaceholder("path/to/note")
					.setValue(this.plugin.settings.defaultMoc)
					.onChange(async (v) => {
						this.plugin.settings.defaultMoc = v;
						await this.plugin.saveSettings();
					}),
			);
	}
}
