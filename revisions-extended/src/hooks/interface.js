/**
 * Overrides Gutenberg `savePost` function.
 */

export const useInterface = () => {
	return {
		clearLocalChanges: ( id ) => {
			// There's gotta be a better approach
			window.sessionStorage.removeItem(
				`wp-autosave-block-editor-post-${ id }`
			);
		},
	};
};
