import React, { Component } from 'react';
import config from '../services/config';
import LinkPreview from './LinkPreview';
import services from '../services';
export default class ContentDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsePost: true
        }
    }
    toggleCollapsePost() {
        this.setState({ collapsePost: !this.state.collapsePost });
    }
    replaceLink(content) {
        var exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var element_content = content.replace(exp_match, "<a class='post-item__hashtag' href='$1'>$1</a>");
        var new_exp_match = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var new_content = element_content.replace(new_exp_match, '$1<a class="post-item__hashtag" target="_blank" href="http://$2">$2</a>');
        return element_content;
    }
    replaceContentTags(str) {
        if (!str) return str;
        str += ' ';
        //replace new line
        str = str.replace(/(?:\r\n|\r|\n)/g, ' <br/>');
        str = this.replaceLink(str);
        //replace tags
        // str = str.replace(/#(.*?) |\n/g, `<a href="/search/$1" class="post-item__hashtag">#$1</a> `);
        str = str.replace(/#(\w*[A-z0-9_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+\w*)\b(?!;)/g, `<a href="/search/$1" class="post-item__hashtag">#$1</a> `);
        return str;
    }
    render() {
        let str = this.replaceContentTags(services.helper.sanitizeHtml(this.props.content));
        // let str = this.replaceContentTags((this.props.content));
        let content = <span dangerouslySetInnerHTML={{ __html: str }} className='text-display'></span>
        if (this.props.content.length > config.maxPostLength) {
            content = <React.Fragment>
                {this.state.collapsePost ? <React.Fragment>
                    <div className='text-display' dangerouslySetInnerHTML={{ __html: this.replaceContentTags(this.props.content.substr(0, config.maxPostLength)) }}></div>
                    <span onClick={this.toggleCollapsePost.bind(this)} className='post-item__content-toggle'>Xem thêm</span>
                </React.Fragment> : <React.Fragment>
                        <div className='text-display' dangerouslySetInnerHTML={{ __html: str }}></div>
                    </React.Fragment>}
            </React.Fragment>
        }
        return <React.Fragment>
            {content}
            {/* <LinkPreview content={this.props.content} /> */}
        </React.Fragment>;
    }
}