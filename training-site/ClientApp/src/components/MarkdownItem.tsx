import React from 'react';
import marked from 'marked';

export interface MarkdownItemProps {
    markdown?: string;
}

const MarkdownItem = React.memo<MarkdownItemProps>(props => {
    const rawMarkup = marked(props.markdown ?? '', {sanitize: true});
    return (<div dangerouslySetInnerHTML={{__html: rawMarkup}} />);
});
export default MarkdownItem;