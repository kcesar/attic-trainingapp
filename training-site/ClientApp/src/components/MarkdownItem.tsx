import React from 'react';
import marked from 'marked';
import DOMPurify from 'dompurify';

export interface MarkdownItemProps {
    markdown?: string;
}

const MarkdownItem = React.memo<MarkdownItemProps>(props => {
    const rawMarkup = DOMPurify.sanitize(marked(props.markdown ?? ''));
    return (<div dangerouslySetInnerHTML={{__html: rawMarkup}} />);
});
export default MarkdownItem;