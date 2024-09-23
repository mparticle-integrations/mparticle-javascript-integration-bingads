//  Copyright 2016 mParticle, Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

var isobject = require('isobject');

var name = 'Bing';
var moduleId = 107;
var MessageType = {
    SessionStart: 1,
    SessionEnd: 2,
    PageView: 3,
    PageEvent: 4,
    CrashReport: 5,
    OptOut: 6,
    Profile: 14,
    Commerce: 16,
};

var constructor = function() {
    var self = this;
    var isInitialized = false;
    var forwarderSettings = null;
    var reportingService = null;

    self.name = name;

    function initForwarder(settings, service, testMode) {
        forwarderSettings = settings;
        reportingService = service;

        try {
            if (!testMode) {
                (function(window, document, tag, url, queue) {
                    var f;
                    var n;
                    var i;
                    (window[queue] = window[queue] || []),
                        (window.uetq = window.uetq || []),
                        (f = function() {
                            var obj = {
                                ti: forwarderSettings.tagId,
                                q: window.uetq,
                            };
                            (obj.q = window[queue]),
                                (window[queue] = new UET(obj)),
                                window[queue].push('pageLoad');
                        }),
                        (n = document.createElement(tag)),
                        (n.src = url),
                        (n.async = 1),
                        (n.onload = n.onreadystatechange = function() {
                            var state = this.readyState;
                            (state &&
                                state !== 'loaded' &&
                                state !== 'complete') ||
                                (f(), (n.onload = n.onreadystatechange = null));
                        }),
                        (i = document.getElementsByTagName(tag)[0]),
                        i.parentNode.insertBefore(n, i);
                })(window, document, 'script', '//bat.bing.com/bat.js', 'uetq');

                if (window.uetq && window.queue && window.queue.length > 0) {
                    for (
                        var i = 0, length = window.queue.length;
                        i < length;
                        i++
                    ) {
                        processEvent(window.queue[i]);
                    }

                    window.queue.length = 0;
                }
            }

            isInitialized = true;
            return 'Successfully initialized: ' + name;
        } catch (e) {
            return "Can't initialize forwarder: " + name + ': ' + e;
        }
    }

    function processEvent(event) {
        if (!isInitialized) {
            return "Can't send to forwarder: " + name + ', not initialized';
        }

        var reportEvent = false;
        try {
            if (
                event.EventDataType == MessageType.PageEvent ||
                event.EventDataType == MessageType.PageView
            ) {
                reportEvent = true;
                logEvent(event);
            } else if (
                event.EventDataType == MessageType.Commerce &&
                event.ProductAction &&
                event.ProductAction.ProductActionType ==
                    mParticle.ProductActionType.Purchase
            ) {
                reportEvent = true;
                logPurchaseEvent(event);
            }

            if (reportEvent && reportingService) {
                reportingService(self, event);
                return 'Successfully sent to forwarder: ' + name;
            }
        } catch (e) {
            return "Can't send to forwarder: " + name + ' ' + e;
        }
    }

    function logEvent(event) {
        if (!isInitialized) {
            return (
                "Can't log event on forwarder: " + name + ', not initialized'
            );
        }

        try {
            var obj = createUetObject(event, 'pageLoad');

            window.uetq.push(obj);
        } catch (e) {
            return "Can't log event on forwarder: " + name + ': ' + e;
        }

        return 'Successfully logged event from forwarder: ' + name;
    }

    function logPurchaseEvent(event) {
        if (!isInitialized) {
            return (
                "Can't log purchase event on forwarder: " +
                name +
                ', not initialized'
            );
        }

        if (
            event.ProductAction.TotalAmount === undefined ||
            event.ProductAction.TotalAmount === null
        ) {
            return "Can't log purchase event without a total amount on product action";
        }

        try {
            var obj = createUetObject(event, 'eCommerce');
            obj.gv = event.ProductAction.TotalAmount;

            window.uetq.push(obj);
        } catch (e) {
            return "Can't log commerce event on forwarder: " + name + ': ' + e;
        }
    }

    function createUetObject(event, action) {
        var obj = {
            ea: action,
            ec: window.mParticle.EventType.getName(event.EventCategory),
            el: event.EventName,
        };

        if (event.CustomFlags && event.CustomFlags['Bing.EventValue']) {
            obj.ev = event.CustomFlags['Bing.EventValue'];
        }

        return obj;
    }

    this.init = initForwarder;
    this.process = processEvent;
};

function getId() {
    return moduleId;
}

function register(config) {
    if (!config) {
        console.log(
            'You must pass a config object to register the kit ' + name
        );
        return;
    }

    if (!isobject(config)) {
        console.log(
            "'config' must be an object. You passed in a " + typeof config
        );
        return;
    }

    if (isobject(config.kits)) {
        config.kits[name] = {
            constructor: constructor,
        };
    } else {
        config.kits = {};
        config.kits[name] = {
            constructor: constructor,
        };
    }
    console.log(
        'Successfully registered ' + name + ' to your mParticle configuration'
    );
}

if (typeof window !== 'undefined') {
    if (window && window.mParticle && window.mParticle.addForwarder) {
        window.mParticle.addForwarder({
            name: name,
            constructor: constructor,
            getId: getId,
        });
    }
}

module.exports = {
    register: register,
};
