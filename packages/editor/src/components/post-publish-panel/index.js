/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { IconButton, Spinner, CheckboxControl } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal Dependencies
 */
import PostPublishButton from '../post-publish-button';
import PostPublishPanelPrepublish from './prepublish';
import PostPublishPanelPostpublish from './postpublish';

class PostPublishPanel extends Component {
	constructor() {
		super( ...arguments );
		this.onSubmit = this.onSubmit.bind( this );
		this.state = {
			loading: false,
			submitted: false,
		};
	}

	static getDerivedStateFromProps( props, state ) {
		if (
			state.submitted ||
			props.isSaving ||
			( ! props.isPublished && ! props.isScheduled )
		) {
			return null;
		}

		return {
			submitted: true,
			loading: false,
		};
	}

	componentDidUpdate( prevProps ) {
		// Automatically collapse the publish sidebar when a post
		// is published and the user makes an edit.
		if ( prevProps.isPublished && ! this.props.isSaving && this.props.isDirty ) {
			this.props.onClose();
		}
	}

	onSubmit() {
		const { onClose, hasPublishAction } = this.props;
		if ( ! hasPublishAction ) {
			onClose();
			return;
		}
		this.setState( { loading: true } );
	}

	render() {
		const { hasPublishAction, isScheduled, isBeingScheduled, onClose, forceIsDirty, forceIsSaving, PrePublishExtension, PostPublishExtension, ...additionalProps } = this.props;
		const { loading, submitted } = this.state;
		let prePublishTitle;

		if ( ! hasPublishAction ) {
			prePublishTitle = __( 'Ready to submit for review?' );
		} else if ( isBeingScheduled ) {
			prePublishTitle = __( 'Ready to schedule?' );
		} else {
			prePublishTitle = __( 'Ready to publish?' );
		}
		return (
			<div className="editor-post-publish-panel" { ...additionalProps }>
				<div className="editor-post-publish-panel__header">
					<strong className="editor-post-publish-panel__title">
						{ prePublishTitle }
					</strong>

					<IconButton
						aria-expanded={ true }
						onClick={ onClose }
						icon="no-alt"
						label={ __( 'Close panel' ) }
					/>
				</div>
				<div className="editor-post-publish-panel__content">
					{ ! loading && ! submitted && (
						<PostPublishPanelPrepublish>
							{ PrePublishExtension && <PrePublishExtension /> }
						</PostPublishPanelPrepublish>
					) }
					{ loading && ! submitted && <Spinner /> }
					{ submitted && (
						<PostPublishPanelPostpublish>
							{ PostPublishExtension && <PostPublishExtension /> }
						</PostPublishPanelPostpublish>
					) }
				</div>

				<div className="editor-post-publish-panel__action-buttons">
					{ ! submitted && (
						<div className="editor-post-publish-panel__header-publish-button">
							<PostPublishButton focusOnMount={ true } onSubmit={ this.onSubmit } forceIsDirty={ forceIsDirty } forceIsSaving={ forceIsSaving } />
						</div>
					) }
					{ submitted && (
						<div className="editor-post-publish-panel__header-published">
							{ isScheduled ? __( 'Scheduled' ) : __( 'Published' ) }
						</div>
					) }
				</div>

				<div className="editor-post-publish-panel__disable-check">
					<CheckboxControl
						label={ __( 'Show this panel every time I publish a post' ) }
						checked={ false }
						onChange={ () => this.onUpdateDisableToggle() }
					/>
				</div>

			</div>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getCurrentPost,
			getCurrentPostType,
			isCurrentPostPublished,
			isCurrentPostScheduled,
			isEditedPostBeingScheduled,
			isSavingPost,
			isEditedPostDirty,
		} = select( 'core/editor' );
		const { isPublishSidebarEnabled } = select( 'core/editor' );
		return {
			postType: getCurrentPostType(),
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			isPublished: isCurrentPostPublished(),
			isScheduled: isCurrentPostScheduled(),
			isBeingScheduled: isEditedPostBeingScheduled(),
			isSaving: isSavingPost(),
			isDirty: isEditedPostDirty(),
			isPublishSidebarEnabled: isPublishSidebarEnabled(),
		};
	} ),
	withDispatch( ( dispatch, { isPublishSidebarEnabled } ) => {
		const { disablePublishSidebar, enablePublishSidebar } = dispatch( 'core/editor' );
		return {
			onTogglePublishSidebar: ( ) => {
				if ( isPublishSidebarEnabled ) {
					disablePublishSidebar();
				} else {
					enablePublishSidebar();
				}
			},
		};
	} ),
] )( PostPublishPanel );
