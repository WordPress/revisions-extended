/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Dropdown, PanelRow } from '@wordpress/components';
import { PostScheduleCheck, PostSchedule as PostScheduleForm, PostScheduleLabel } from '@wordpress/editor';

export function PostSchedule() {
	return (
		<PostScheduleCheck>
			<PanelRow className="edit-post-post-schedule">
				<span>{ __( 'Publish', 'revisions-extended' ) }</span>
				<Dropdown
					position="bottom left"
					contentClassName="edit-post-post-schedule__dialog"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<>
							<Button
								className="edit-post-post-schedule__toggle"
								onClick={ onToggle }
								aria-expanded={ isOpen }
								isTertiary
							>
								<PostScheduleLabel />
							</Button>
						</>
					) }
					renderContent={ () => <PostScheduleForm /> }
				/>
			</PanelRow>
		</PostScheduleCheck>
	);
}

export default PostSchedule;
