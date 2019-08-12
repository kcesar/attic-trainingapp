import React from 'react'
import marked from 'marked'

const MarkdownItem = React.memo(props => {
    const rawMarkup = marked(props.markdown || '', {sanitize: true});
    return <div dangerouslySetInnerHTML={{__html: rawMarkup}} />
})
export default MarkdownItem