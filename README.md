# Viewer Ftags Chips

_Do you know what ftags (clones, symlinks) are? If not, you should definitely check [this](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load?tab=readme-ov-file#wait-a-minute-what-are-folderindex-notes-what-are-ftags-what-do-you-mean-annexed) out._

Add tag-styled chips on top of each file view in the workspace, representing all the ftags assigned to the file. Immediate parent tags are rendered the brightest and include a button to remove the connection. If removing an ftag leaves the file with no non-inbox ftags, it is sent to the inbox folder.

https://github.com/user-attachments/assets/2cbeb33f-cd97-482f-acd1-a24964fa7941

Higher-level tags ('grandparents') are rendered semi-transparent. The more distant a parent is, the more transparent its chip becomes.

https://github.com/user-attachments/assets/9e2aef2a-88b8-4502-8668-294d7ef5f1d2

If you have [crosslink-advanced](https://github.com/d7sd6u/obsidian-crosslink-advanced) enabled, a button for adding new tags appears to the left of the tags:

https://github.com/user-attachments/assets/988772c5-2024-48d0-ad0e-8239334ecde0

---

Additionally, the plugin adds child chips below the ftag chips.

https://github.com/user-attachments/assets/32783dba-096c-40b4-96eb-4ea613071cbf

If the file has more than 5 children, it shows only the first 5 and adds an ellipsis item to show the rest.

You can change how these children are displayed. The plugin settings let you
show them as chips in the top bar (the default), list them inside the Files
panel, or hide them completely.

https://github.com/user-attachments/assets/c2ce464c-f29a-4194-95c8-ab362b084c74

---

All chips support tooltips on hover and allow opening the file menu on right-click—just like file explorer items.

https://github.com/user-attachments/assets/65560688-9fce-4c03-b77f-e5ee27b62525

## Other plugins

- [lazy-cached-vault-load](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load) - Reduces startup time on mobile to 2-3 seconds, even with a vault containing 30k+ notes.
- [reveal-folded](https://github.com/d7sd6u/obsidian-reveal-folded) - Adds a command that reveals the current file in the file explorer while collapsing all other items.
- [auto-folder-note-paste](https://github.com/d7sd6u/obsidian-auto-folder-note-paste) - Ensures your attachments are placed inside your note when pasting or using drag-and-drop by converting your note into a folder note.
- [folders-graph](https://github.com/d7sd6u/obsidian-folders-graph) - Adds folders as nodes in graph views.
- [hide-index-files](https://github.com/d7sd6u/obsidian-hide-index-files) - Hides folder notes (index files) from the file explorer.
- [crosslink-advanced](https://github.com/d7sd6u/obsidian-crosslink-advanced) - Adds commands for managing [ftags](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load?tab=readme-ov-file#wait-a-minute-what-are-folderindex-notes-what-are-ftags-what-do-you-mean-annexed)-oriented vaults: adding ftags, creating child notes, opening random unftagged file, etc.
- [virtual-dirs](https://github.com/d7sd6u/obsidian-virtual-dirs) - Adds 'virtual' folder files or folder indexes. You can open and search for them, but they do not take up space and 'materialize' whenever you need a real folder note.
- [viewer-ftags](https://github.com/d7sd6u/obsidian-viewer-ftags) - add ftags as chips on top of markdown/file editors/previews. And children as differently styled chips too!
- [git-annex-autofetch](https://github.com/d7sd6u/obsidian-git-annex-autofetch) - Allows you to open annexed files that are not locally present as if they were on your device (essentially, an NFS/overlay-fs hybrid in Obsidian).

## Disclamer / Safety

This plugin uses certain file system APIs that can modify files, such as writing and moving them. However, it should not make any irreversible changes, as it only moves files and modifies symlinks in notes' frontmatter. That said, always [back up](https://en.wikipedia.org/wiki/Backup#:~:text=3-2-1%20rule) your vault whether you use this plugin or not.

## Contributing

Issues and patches are welcome. This plugin is designed to work alongside other plugins, and I will do my best to support such use cases. However, I retain the right to refuse support for any given plugin at my discretion.
