# TODO: Essential Features for Jujutsu (jj) Desktop GUI

## 1. Core Visualization

* [ ] **Working Copy Auto-commit Visualization**: Since `jj` treats the working copy itself as a commit, always display the `@` node at the top of the graph to reflect current changes.
* [ ] **Dual ID Management (Change ID vs Commit ID)**: Provide a UI to distinguish between the logical unit (Change ID) and the historical version (Commit ID) of a commit.
* [ ] **Operation Log Explorer**: Visualize the history of all executed commands and provide functionality to 'Undo' or explore the repository state at a specific point in time.
* [ ] **Evolution Log View**: Dedicated timeline UI showing the modification history (rewrite history) of a specific Change ID.

## 2. Smart Change Management

* [ ] **`jj absorb` Interface**: Provide a button to automatically assign changes in the working copy to relevant previous commits.
* [ ] **Conflicts as First-Class Citizens**: Show commits containing conflicts clearly (since `jj` allows committing conflicts) and support a workflow to resolve them via 3-way merge in the GUI.
* [ ] **Divergence Resolution UI**: Detect when multiple commits share the same Change ID and guide the user to either abandon or merge them.

## 3. Advanced Repo Operations

* [ ] **Drag-and-Drop Rebase**: Intuitive operation where dragging a commit node and dropping it onto another executes the `jj rebase` command.
* [ ] **Commit Splitting and Squashing (Split & Squash)**: UI to divide an existing commit by selecting specific files or squash current changes into a previous commit.
* [ ] **Anonymous Headers (Anonymous Heads) Management**: Display heads without bookmarks in the graph so users don't lose them and can attach bookmarks at any time.

## 4. Git Interoperability & Remote Management (Git Interop)

* [ ] **Colocation Status Display**: Visualize synchronization status between `.git` and `.jj` when they coexist in the same directory.
* [ ] **Bookmark Management**: Settings window to create, move, and track bookmarks (mapping to Git branches).
* [ ] **Safe Push Check**: Confirmation procedure to prevent accidents when local and remote bookmark positions differ.

## 5. Config & UX

* [ ] **Revset/Fileset Query Builder**: Search bar that allows finding commits or files via filters without having to manually type complex `jj` query strings.
* [ ] **Multiple Workspaces Support**: Easily switch between and manage multiple working directories sharing the same repository.
* [ ] **Auto-snapshot Configuration**: Visibility and control over automatic snapshots taken before and after command execution.