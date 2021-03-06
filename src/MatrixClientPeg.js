/*
Copyright 2015, 2016 OpenMarket Ltd

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

import Matrix from 'matrix-js-sdk';
import utils from 'matrix-js-sdk/lib/utils';

const localStorage = window.localStorage;

interface MatrixClientCreds {
    homeserverUrl: string,
    identityServerUrl: string,
    userId: string,
    deviceId: string,
    accessToken: string,
    guest: boolean,
}

/**
 * Wrapper object for handling the js-sdk Matrix Client object in the react-sdk
 * Handles the creation/initialisation of client objects.
 * This module provides a singleton instance of this class so the 'current'
 * Matrix Client object is available easily.
 */
class MatrixClientPeg {
    constructor() {
        this.matrixClient = null;

        // These are the default options used when when the
        // client is started in 'start'. These can be altered
        // at any time up to after the 'will_start_client'
        // event is finished processing.
        this.opts = {
            initialSyncLimit: 20,
        };
    }

    get(): MatrixClient {
        return this.matrixClient;
    }

    unset() {
        this.matrixClient = null;
    }

    /**
     * Replace this MatrixClientPeg's client with a client instance that has
     * Home Server / Identity Server URLs and active credentials
     */
    replaceUsingCreds(creds: MatrixClientCreds) {
        this._createClient(creds);
    }

    start() {
        const opts = utils.deepCopy(this.opts);
        // the react sdk doesn't work without this, so don't allow
        opts.pendingEventOrdering = "detached";
        this.get().startClient(opts);
    }

    getCredentials(): MatrixClientCreds {
        return {
            homeserverUrl: this.matrixClient.baseUrl,
            identityServerUrl: this.matrixClient.idBaseUrl,
            userId: this.matrixClient.credentials.userId,
            deviceId: this.matrixClient.getDeviceId(),
            accessToken: this.matrixClient.getAccessToken(),
            guest: this.matrixClient.isGuest(),
        };
    }

    _createClient(creds: MatrixClientCreds) {
        var opts = {
            baseUrl: creds.homeserverUrl,
            idBaseUrl: creds.identityServerUrl,
            accessToken: creds.accessToken,
            userId: creds.userId,
            deviceId: creds.deviceId,
            timelineSupport: true,
        };

        if (localStorage) {
            opts.sessionStore = new Matrix.WebStorageSessionStore(localStorage);
        }

        this.matrixClient = Matrix.createClient(opts);

        // we're going to add eventlisteners for each matrix event tile, so the
        // potential number of event listeners is quite high.
        this.matrixClient.setMaxListeners(500);

        this.matrixClient.setGuest(Boolean(creds.guest));
    }
}

if (!global.mxMatrixClientPeg) {
    global.mxMatrixClientPeg = new MatrixClientPeg();
}
module.exports = global.mxMatrixClientPeg;
