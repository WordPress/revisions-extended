import {
	MenuGroup,
	MenuItem,
	DropdownMenu,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { arrowDown } from '@wordpress/icons';
import './index.css';

import { Button, Modal, DateTimePicker } from '@wordpress/components';
import { __experimentalGetSettings } from '@wordpress/date';
import { useState } from '@wordpress/element';
import { withState } from '@wordpress/compose';

const MyDateTimePicker = withState( {
	date: new Date(),
} )( ( { date, setState } ) => {
	const settings = __experimentalGetSettings();

	// To know if the current timezone is a 12 hour time with look for an "a" in the time format.
	// We also make sure this a is not escaped by a "/".
	const is12HourTime = /a(?!\\)/i.test(
		settings.formats.time
			.toLowerCase() // Test only the lower case a
			.replace( /\\\\/g, '' ) // Replace "//" with empty strings
			.split( '' )
			.reverse()
			.join( '' ) // Reverse the string and test for "a" not followed by a slash
	);

	return (
		<DateTimePicker
			currentDate={ date }
			onChange={ ( date ) => {
				setState( { date } );
			} }
			is12Hour={ is12HourTime }
		/>
	);
} );

const MyModal = ( { onClose } ) => {
	const [ step, setStep ] = useState( 0 );

	return (
		<Modal
			title="Select Future Date"
			onRequestClose={ ( { type } ) => {
				// This was triggered by the datepicker, we don't want to close yet.
				if ( type === 'blur' ) {
					return;
				}
				onClose();
			} }
		>
			{ step === 0 && (
				<>
					<MyDateTimePicker />
					<Flex justify="flex-end">
						<FlexItem>
							<Button isPrimary onClick={ () => setStep( 1 ) }>
								Select Date
							</Button>
						</FlexItem>
					</Flex>
				</>
			) }

			{ step === 1 && (
				<div>
					<p>Creating a revision for Janurary 12</p>
					<Flex>
						<FlexItem>
							<Button onClick={ () => setStep( 0 ) }>
								Back
							</Button>
						</FlexItem>
						<FlexItem>
							<Button isPrimary onClick={ () => setStep( 1 ) }>
								Create update
							</Button>
						</FlexItem>
					</Flex>
				</div>
			) }
		</Modal>
	);
};

const DropdownBtn = ( { onClick } ) => {
	const [ showModal, setShowModal ] = useState( false );

	return (
		<div className="dropdown-btn">
			<DropdownMenu
				className="dropdown-btn-toggle"
				icon={ arrowDown }
				label="Select a direction"
			>
				{ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							info="Publish changes in the future"
							onClick={ () => {
								onClose();
								setShowModal( true );
							} }
						>
							Schedule update
						</MenuItem>
						<MenuItem
							info="Save changes"
							onClick={ () => console.log( 'something' ) }
						>
							Save for later
						</MenuItem>
					</MenuGroup>
				) }
			</DropdownMenu>
			{ showModal && <MyModal onClose={ () => setShowModal( false ) } /> }
		</div>
	);
};

export default DropdownBtn;
