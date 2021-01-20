/**
 * Internal dependencies
 */
import './index.css';

const Message = ( { children, type } ) => {
	return (
		<div
			className={ `revision-extended-message revision-extended-message-${ type }` }
		>
			{ children }
		</div>
	);
};

const WarningMessage = ( { children } ) => {
	return <Message type="is-warning">{ children }</Message>;
};

const SuccessMessage = ( { children } ) => {
	return <Message type="is-success">{ children }</Message>;
};

const ErrorMessage = ( { children } ) => {
	return <Message type="is-error">{ children }</Message>;
};

export { WarningMessage, SuccessMessage, ErrorMessage };
