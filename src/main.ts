import {
        App,
        FuzzySuggestModal,
        IconName,
        MarkdownView,
        Menu,
        Modal,
        Platform,
	setIcon,
	Setting,
	setTooltip,
	TFile,
	parseFrontMatterStringArray,
	parseLinktext,
} from "obsidian";
import {
	getFileChildrenIndexes,
	getFileParentIndexes,
} from "../obsidian-reusables/src/ftags";
import uniq from "lodash-es/uniq";
import prettyBytes from "pretty-bytes";
import { ViewType } from "obsidian-typings/src/obsidian/implementations/Constants/ViewType";
import PluginWithSettings from "../obsidian-reusables/src/PluginWithSettings";
import { DEFAULT_SETTINGS, ChildrenDisplayMode } from "./settings";
import { MainPluginSettingsTab } from "./settings";

export default class StaticTagChipsPlugin extends PluginWithSettings(
	DEFAULT_SETTINGS,
) {
	override async onload() {
		await this.initSettings(MainPluginSettingsTab);
		this.injectChips();

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				this.injectChips();
			}),
		);

		this.registerEvent(
			this.app.vault.on("rename", () => {
				this.injectChips();
			}),
		);
		this.registerEvent(
			this.app.vault.on("delete", () => {
				this.injectChips();
			}),
		);
		this.registerEvent(
			this.app.vault.on("create", (file) => {
				if (file.parent === this.app.workspace.getActiveFile()?.parent)
					this.injectChips();
			}),
		);

		this.registerEvent(
			this.app.metadataCache.on("changed", () => {
				this.injectChips();
			}),
		);
	}

	injectChildren() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (
			!activeView ||
			!("file" in activeView && activeView.file instanceof TFile)
		)
			return;

		const existing = activeView.containerEl.querySelector(
			".ftags-children-outer",
		);
		let mode: ChildrenDisplayMode;
		if (typeof this.settings.showChildren === "string") {
			mode = this.settings.showChildren as ChildrenDisplayMode;
		} else {
			mode = this.settings.showChildren ? "limited" : "off";
		}
		if (mode === "off") {
			existing?.remove();
			return;
		}

		const currentFile = activeView.file;
		const header = activeView.containerEl.querySelector(".view-header");
		if (!header) return;

		if (existing) existing.remove();

		const outer = header.createDiv({
			cls: "ftags-children-outer",
		});
		const inner = outer.createDiv({
			cls: "ftags-children",
		});

		const tags = activeView.containerEl.querySelector(
			".static-tag-chips-container-outer",
		);
		tags?.insertAdjacentElement("afterend", outer);

		const children = getFileChildrenIndexes(currentFile, this.app);
		const items = mode === "limited" ? children.slice(0, 5) : children;
		for (const child of items) {
			inner.appendChild(this.createChildItem(child, currentFile));
		}
		if (mode === "limited" && children.length > 5) {
			const c = createTreeItem("/", "...", "folder");
			inner.appendChild(c);
			c.addEventListener("click", () => {
				this.app.commands.executeCommandById(
					"file-explorer:reveal-active-file",
				);
			});
		}
	}

	createChildItem(file: TFile, source: TFile) {
		const extToIcon: Record<string, IconName> = Object.fromEntries(
			Object.entries({ image: ["jpg", "png"] }).flatMap(([icon, exts]) =>
				exts.map((e) => [e, icon]),
			),
		);
		const isIndex = file.parent?.name === file.basename;
		const item = createTreeItem(
			file.path,
			file.basename,
			isIndex ? "folder" : (extToIcon[file.extension] ?? "file"),
		);
		this.addFileElHandlers(item, file, source);

		return item;
	}

	addFileElHandlers(item: HTMLElement, file: TFile, source: TFile) {
		item.addEventListener("mouseenter", (e) => {
			this.highlightFileEntry(
				file.basename === file.parent?.name
					? file.parent.path
					: file.path,
			);
			if (e.ctrlKey) {
				this.app.workspace.trigger("hover-link", {
					event: e,
					source: source,
					hoverParent: item.parentElement,
					targetEl: item,
					linktext: file.path,
				});
			}
		});
		setTooltip(
			item,
			`${file.name}\n\nLast modified at ${window
				.moment(file.stat.mtime)
				.format("YYYY-MM-DD HH:mm")}\nCreated at ${window
				.moment(file.stat.ctime)
				.format("YYYY-MM-DD HH:mm")}\nSize ${prettyBytes(
				file.stat.size,
			)}`,
		);
		item.addEventListener("mouseleave", () => {
			this.removeHighlightFileEntry();
		});
		const showMenu = (e: { pageX: number; pageY: number }) => {
			const menu = new Menu();
			menu.addItem((e) =>
				e
					.setSection("open")
					.setTitle("Open child")
					.setIcon("lucide-file")
					.onClick(() => this.app.workspace.getLeaf().openFile(file)),
			);

			menu.addItem((e) =>
				e
					.setSection("open")
					.setTitle("Open in new tab")
					.setIcon("lucide-file-plus")
					.onClick(() =>
						this.app.workspace.getLeaf("tab").openFile(file),
					),
			);

			if (Platform.isDesktop) {
				menu.addItem((e) =>
					e
						.setSection("open")
						.setTitle("Open to the right")
						.setIcon("lucide-separator-vertical")
						.onClick(() =>
							this.app.workspace.getLeaf("split").openFile(file),
						),
				);
			}

			menu.addItem((e) =>
				e
					.setSection("action")
					.setTitle("Rename")
					.setIcon("lucide-edit-3")
					.onClick(() =>
						this.app.fileManager.promptForFileRename(file),
					),
			);
			menu.addItem((e) =>
				e
					.setSection("danger")
					.setTitle("Remove")
					.setWarning(true)
					.setIcon("lucide-trash-2")
					.onClick(() =>
						this.app.fileManager.promptForDeletion(file),
					),
			);
			this.app.workspace.trigger("file-menu", menu, file, source);
			menu.showAtPosition({ x: e.pageX, y: e.pageY });
		};
		item.addEventListener("contextmenu", (e) => {
			showMenu(e);
		});
		item.addEventListener("click", () => {
			void this.app.workspace.getLeaf().openFile(file);
			this.removeHighlightFileEntry();
		});
	}

	injectChips() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		type ViewType = (typeof ViewType)[keyof typeof ViewType];

		if (
			!activeView ||
			!(
				[
					"markdown",
					"audio",
					"pdf",
					"image",
					"canvas",
					"dirview",
				] as ViewType[]
			).includes(activeView.getViewType() as ViewType)
		)
			return;
		this.injectTags();
		this.injectChildren();
	}

	injectTags() {
		this.injectChildren();
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (
			!activeView ||
			!("file" in activeView && activeView.file instanceof TFile)
		)
			return;
		const currentFile = activeView.file;

		const header = activeView.containerEl.querySelector(".view-header");
		if (!header) return;

		const existing = activeView.containerEl.querySelector(
			".static-tag-chips-container-outer",
		);
		if (existing) existing.remove();

		const outer = header.createDiv({
			cls: "static-tag-chips-container-outer",
		});
                const chipContainer = outer.createDiv({
                        cls: "static-tag-chips-container",
                });
                header.insertAdjacentElement("afterend", outer);

                const addMoc = chipContainer.createSpan({
                        cls: "cm-hashtag cm-hashtag-end cm-hashtag-begin",
                });
                addMoc.setText("+ Add MoC...");
                addMoc.addEventListener("click", () => {
                        new AddMocModal(this.app, currentFile, async (file) => {
                                await this.addMocToFile(file, currentFile);
                                this.injectChips();
                        }).open();
                });
                chipContainer.prepend(addMoc);

		const fm =
			this.app.metadataCache.getFileCache(currentFile)?.frontmatter;
		const mocEntries =
			parseFrontMatterStringArray(fm ?? null, "MoCs") ?? [];
		const parents = mocEntries
			.map((entry) => {
				if (entry.startsWith("[[") && entry.endsWith("]]")) {
					entry = entry.slice(2, -2);
				}
				const link = entry.includes("|") ? entry.split("|")[0]! : entry;
				const { path } = parseLinktext(link);
				return this.app.metadataCache.getFirstLinkpathDest(
					path,
					currentFile.path,
				);
			})
			.filter((v): v is TFile => v instanceof TFile);

		const addChip = (
			parent: TFile,
			layer: "first" | "second" | "third" | "fourth",
			toplevel?: boolean,
		) => {
			const chip = chipContainer.createSpan({
				cls: "cm-hashtag cm-hashtag-end cm-hashtag-begin",
			});
			chip.classList.add(`viewer-ftag-tag-chip-layer-${layer}`);
			this.addFileElHandlers(chip, parent, currentFile);
			chip.setText("#" + parent.basename);
			if (!toplevel) return;
			const remove = chip.createSpan();
			setIcon(remove, "x");
			remove.addEventListener("click", (e) => {
				e.stopPropagation();

				new ConfirmationModal(
					this.app,
					async () => {
						await this.removeMocFromFile(parent, currentFile);
						this.injectChips();
					},
					parent,
				).open();
			});
		};

		const visited = new Set(parents.map((v) => v.path));
		const getNext = (p: typeof parents) =>
			uniq(
				p
					.filter((v) => v.path !== this.settings.defaultMoc)
					.flatMap((v) => getFileParentIndexes(v, this.app)),
			)
				.filter((v) => !visited.has(v.path))
				.map((v) => (visited.add(v.path), v));
		const next = getNext(parents);
		for (const parent of parents) {
			addChip(parent, "first", true);
		}
		for (const nextParent of next) {
			addChip(nextParent, "second");
		}
		const nextnext = getNext(next);
		for (const nextParent of nextnext) {
			addChip(nextParent, "third");
		}
		for (const nextParent of getNext(nextnext)) {
			addChip(nextParent, "fourth");
		}
	}

        async removeMocFromFile(parent: TFile, file: TFile) {
                await this.app.fileManager.processFrontMatter(file, (fm) => {
                        let entries = parseFrontMatterStringArray(fm ?? null, "MoCs") ?? [];
                        entries = entries.filter((entry) => {
                                let original = entry;
				if (original.startsWith("[[") && original.endsWith("]]"))
					original = original.slice(2, -2);
				const link = original.includes("|")
					? original.split("|")[0]!
					: original;
				const { path } = parseLinktext(link);
				const dest = this.app.metadataCache.getFirstLinkpathDest(
					path,
					file.path,
				);
				return dest?.path !== parent.path;
			});

			if (entries.length === 0 && this.settings.defaultMoc) {
				entries.push(this.settings.defaultMoc);
			}

                        fm.MoCs = entries;
                });
        }

        async addMocToFile(parent: TFile, file: TFile) {
                await this.app.fileManager.processFrontMatter(file, (fm) => {
                        const entries = parseFrontMatterStringArray(fm ?? null, "MoCs") ?? [];
                        const link = `[[${this.app.metadataCache.fileToLinktext(parent, file.path)}]]`;
                        if (!entries.includes(link)) {
                                entries.push(link);
                        }
                        fm.MoCs = entries;
                });
        }

	highlightFileEntry(filePath: string) {
		const entries = document.querySelectorAll(`[data-path="${filePath}"]`);
		entries.forEach((entry) => {
			if (!entry.classList.contains("is-active"))
				entry.classList.add(
					"is-active",
					"is-highlighted-via-viewer-ftags",
				);
		});
	}

	removeHighlightFileEntry() {
		const entries = document.querySelectorAll(
			`.is-highlighted-via-viewer-ftags`,
		);
		entries.forEach((entry) => {
			entry.classList.remove(
				"is-active",
				"is-highlighted-via-viewer-ftags",
			);
		});
	}
	override onunload() {
		this.app.workspace.iterateAllLeaves((leaf) => {
			leaf.view.containerEl
				.querySelector(".static-tag-chips-container-outer")
				?.remove();
			leaf.view.containerEl
				.querySelector(".ftags-children-outer")
				?.remove();
		});
	}
}

export class ConfirmationModal extends Modal {
	constructor(app: App, onSubmit: () => void, ftag: TFile) {
		super(app);
		this.setTitle("Do you want to untag?");

		this.setContent(
			`Are you sure you want to remove this tag: ${ftag.basename}`,
		);

		const set = new Setting(this.contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Delete")
					.setWarning()
					.setCta()
					.onClick(() => {
						this.close();
						onSubmit();
					}),
			)
			.addButton((btn) =>
				btn
					.setButtonText("Cancel")
					.setCta()
					.onClick(() => {
						this.close();
					}),
			);
		set.settingEl.classList.add("viewer-ftags-custom-setting-el");
        }
}

export class AddMocModal extends FuzzySuggestModal<TFile> {
        constructor(
                app: App,
                private current: TFile,
                private onSubmit: (file: TFile) => void,
        ) {
                super(app);
                this.setPlaceholder("Choose note to add as MoC");
        }

        getItems(): TFile[] {
                return this.app.vault.getMarkdownFiles();
        }

        getItemText(item: TFile): string {
                return this.app.metadataCache.fileToLinktext(item, this.current.path);
        }

        onChooseItem(item: TFile) {
                this.onSubmit(item);
        }
}
function createTreeItem(
	path: string,
	label: string,
	customIcon: string,
): HTMLElement {
	const treeItem = createEl("div", {
		cls: "tree-item",
		attr: { "data-path": path },
	});
	const treeItemSelf = createDiv({
		cls: "tree-item-self viewer-ftags-custom-tree-item bookmark is-clickable is-active",
		attr: {
			draggable: "true",
		},
	});
	treeItem.appendChild(treeItemSelf);
	const treeItemIcon = createEl("div", { cls: "tree-item-icon" });
	treeItemSelf.appendChild(treeItemIcon);
	const treeItemInner = createEl("div", { cls: "tree-item-inner" });
	treeItemSelf.appendChild(treeItemInner);
	setIcon(treeItemIcon, customIcon);

	const treeItemText = createEl("span", {
		cls: "tree-item-inner-text",
		text: label,
	});
	treeItemInner.appendChild(treeItemIcon);
	treeItemInner.appendChild(treeItemText);
	return treeItem;
}
