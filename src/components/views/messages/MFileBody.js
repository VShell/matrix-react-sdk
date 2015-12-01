/*
Copyright 2015 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var React = require('react');
var filesize = require('filesize');
var MatrixClientPeg = require('../../../MatrixClientPeg');

module.exports = React.createClass({
    displayName: 'MFileBody',

    presentableTextForFile: function(content) {
        var linkText = 'Attachment';
        if (content.body && content.body.length > 0) {
            linkText = content.body;
        }

        var additionals = [];
        if (content.info) {
            // if (content.info.mimetype && content.info.mimetype.length > 0) {
            //    additionals.push(content.info.mimetype);
            // }
            if (content.info.size) {
                additionals.push(filesize(content.info.size));
            }
        }

        if (additionals.length > 0) {
            linkText += ' (' + additionals.join(', ') + ')';
        }
        return linkText;
    },

    render: function() {
        var content = this.props.mxEvent.getContent();
        var cli = MatrixClientPeg.get();

        var httpUrl = cli.mxcUrlToHttp(content.url);
        var text = this.presentableTextForFile(content);

        if (httpUrl) {
            return (
                <span className="mx_MFileTile">
                    <div className="mx_MImageTile_download">
                        <a href={cli.mxcUrlToHttp(content.url)} target="_blank">
                            <img src="img/download.png" width="10" height="12"/>
                            Download {text}
                        </a>
                    </div>
                </span>
            );
        } else {
            var extra = text ? ': '+text : '';
            return <span className="mx_MFileTile">
                Invalid file{extra}
            </span>
        }
    },
});