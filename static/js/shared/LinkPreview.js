import React, { Component } from 'react';
import Microlink from '@microlink/react'
export default class LinkPreview extends Component {
    render() {
        let url = '';
        if (this.props.content) {
            var re = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            let m = re.exec(this.props.content + ' ');
            if (m) url = m[0];
        }
        if (!url) return null;
        return <div className='link-preview mt-2'>
            <Microlink
                url={url}
            />
        </div>
    }
}