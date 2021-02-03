/**
 * Internal dependencies
 */
import './index.css';

const RevisionList = ( { items } ) => {
	return (
		<ul className="revisions-extended-revision-list">
			{ items.map( ( i ) => (
				<li key={ i.href }>
					<a href={ i.href }>{ i.text }</a>
					<span className="revisions-extended-revision-list__status">
						{ i.status }
					</span>
				</li>
			) ) }
		</ul>
	);
};

export default RevisionList;
