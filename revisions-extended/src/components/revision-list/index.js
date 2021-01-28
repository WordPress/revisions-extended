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
				</li>
			) ) }
		</ul>
	);
};

export default RevisionList;
