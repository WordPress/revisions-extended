import { registerPlugin } from '@wordpress/plugins';
import { useSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import apiFetch from '@wordpress/api-fetch';

import { PluginNamespace } from '../configs';

const PluginDocumentSettingPanelDemo = () => {
	// This will get the post
	const post = useSelect((select) => {
		return select('core/editor').getCurrentPost();
	}, []);

	const updatePost = async () => {
		const { id } = post;

		const res = await apiFetch({
			path: `/wp/v2/posts/${id}`,
			method: 'POST',
			data: { title: 'New Post Title 2' },
        })
        
        console.log( res );
    };
    

	return (
		<PluginDocumentSettingPanel
			name="custom-panel"
			title="Custom Panel"
			className="custom-panel"
		>
			<button onClick={() => updatePost()}>Update Post</button>
		</PluginDocumentSettingPanel>
	);
};

registerPlugin(`${PluginNamespace}-document-slot`, {
	render: PluginDocumentSettingPanelDemo,
});
