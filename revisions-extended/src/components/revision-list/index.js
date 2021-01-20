const RevisionList = ( { items } ) => {
	return items.map( ( i ) => (
		<div key={ i.id }>
			{ i.slug } (id: { i.id })
		</div>
	) );
};

export default RevisionList;
