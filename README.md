# Viewer Ftags Chips

*Do you know what ftags (clones, symlinks) are? If not, you should definitely check [this](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load?tab=readme-ov-file#wait-a-minute-what-are-folderindex-notes-what-are-ftags-what-do-you-mean-annexed) out.*

This plugin adds tag-styled chips on top of every file view in the workspace that represent all the ftags the view's file has. Immediate parents are rendered the brightest and have a button to remove the connection (the file is sent to inbox folder if that ftag was the last non-inbox ftag). 

https://github.com/user-attachments/assets/2cbeb33f-cd97-482f-acd1-a24964fa7941

Higher-level tags ("grandparents") are rendered semi-transparent, the more distant a parent is the more transparent its chip is. 

https://github.com/user-attachments/assets/9e2aef2a-88b8-4502-8668-294d7ef5f1d2

Additionally, a button that adds new tags is added to the left of the tags if you have [crosslink-advanced](https://github.com/d7sd6u/obsidian-crosslink-advanced) enabled:

https://github.com/user-attachments/assets/988772c5-2024-48d0-ad0e-8239334ecde0

---

Also, the plugin adds children chips below ftags chips. 

https://github.com/user-attachments/assets/32783dba-096c-40b4-96eb-4ea613071cbf

If the file has more than 5 children, it shows only the first 5 and adds ellipsis item to show the rest.

https://github.com/user-attachments/assets/c2ce464c-f29a-4194-95c8-ab362b084c74

---

All chips support showing tooltip on hover and opening file menu on right click - just like file explorer items.

https://github.com/user-attachments/assets/65560688-9fce-4c03-b77f-e5ee27b62525

## Other plugins

- [lazy-cached-vault-load](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load) - reduce startup time on mobile to 2-3s even with 30k+ notes vault
- [auto-folder-note-paste](https://github.com/d7sd6u/obsidian-auto-folder-note-paste) - makes sure your attachments are "inside" your note on paste and drag'n'drop by making your note a folder note
- [folders-graph](https://github.com/d7sd6u/obsidian-folders-graph) - adds folders as nodes to graph views
- [reveal-folded](https://github.com/d7sd6u/obsidian-reveal-folded) - reveal current file in file explorer while collapsing everything else
- [hide-index-files](https://github.com/d7sd6u/obsidian-hide-index-files) - hide folder notes (index files) from file explorer
- [crosslink-advanced](https://github.com/d7sd6u/obsidian-crosslink-advanced) - adds commands to deal with [ftags](https://github.com/d7sd6u/obsidian-lazy-cached-vault-load?tab=readme-ov-file#wait-a-minute-what-are-folderindex-notes-what-are-ftags-what-do-you-mean-annexed)-oriented vaults: add ftags, create child note, open random unftagged file, etc.
- [virtual-dirs](https://github.com/d7sd6u/obsidian-virtual-dirs) - adds "virtual" folder files / folder indexes. You can open them, you can search for them, but they do not take space and "materialise" whenever you want a _real_ folder note
- [git-annex-autofetch](https://github.com/d7sd6u/obsidian-git-annex-autofetch) - lets you open annexed but not present files as if they were right on your device (basically, NFS/overlay-fs hybrid in your Obsidian)

## Disclamer / Safety

This plugin calls some of the destructive file system APIs (write, move). However it should not make any irreversible changes (only moving files and changing `.symlinks` in notes' frontmatter). That said, always [backup](https://en.wikipedia.org/wiki/Backup#:~:text=3-2-1%20rule) your vault whether you use this plugin or not.
## Contributing

Issues and patches are welcome. This plugin is intended to be used with other plugins and I would try to do my best to support this use case, but I retain the right to refuse supporting any given plugin for arbitrary reasons.
