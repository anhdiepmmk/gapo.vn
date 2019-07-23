import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
export default class Relation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false

        }
        this.toggle = this.toggle.bind(this);
    }
    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }
    render() {
        let { item, index, isMe, cancelFriend, requestUserRelation, removeSuggest } = this.props;
        if (isMe) return (
            <div style={{ height: 28 }} />
        )
        if (item.relation === "pending") {
            return (
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle className="btn btn-light btn-sm" >
                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                        Đã gửi lời mời
                </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem onClick={() => cancelFriend(item.id, index, 'suggest')}>Huỷ lời mời</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            )
        }
        if (item.relation === "friend") {
            return (
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle className="btn btn-block btn-sm btn-light" >
                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                        Bạn bè
                </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem >Nhận thông báo</DropdownItem>
                        <DropdownItem onClick={() => cancelFriend(item.id, index, 'receive')}>Huỷ kết bạn</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            )
        }
        return (
            <>
                <button onClick={() => requestUserRelation(item.id, index)} className="btn btn-primary-light btn-sm mr-1">Kết bạn</button>
                <button onClick={() => removeSuggest(item.id, index)} className="btn btn-light btn-sm">Xoá</button>
            </>
        )

    }
}