"use strict";

/**
 * Class allowing to handle connection loss. Once started, periodically checks if an url can or
 * cannot be accessed, sets the connection status accordingly and dispatches an event every time
 * connection is lost or gained.
 */
class Offline {
    /**
     * Constructor. Use setOptions to set parameters for the handler.
     */
    constructor() {
        this.path = "./favicon.ico";
        this.interval = 5000;
        this.timeout = 1500;
        this.isOnline = null;
        this.onEvent = new Event("on");
        this.offEvent = new Event("off");
        this.intervalID = null;
    }

    /**
     * Set parameters for the connection handler.
     * @param {Object} options new parameters of the connection handler (path, interval, timeout)
     * @param {string} options.path url of the file or page which will be used to check the connection
     * (favicon.ico by default)
     * @param {number} options.interval number of milliseconds to wait between each ping (5000 ms by default)
     * @param {number} options.timeout number of milliseconds to wait during each ping (1500 ms by default)
     * @return {void}
     */
    setOptions({path = "./favicon.ico", interval = 5000, timeout = 1500} = {}) {
        this.path = path;
        this.interval = interval;
        this.timeout = timeout;
    }

    /**
     * Sets a method to execute immediately after the page or the file goes online.
     * @param {function} func function to execute
     * @return {void}
     */
    on(func) {
        window.addEventListener("on", func);
    }

    /**
     * Sets a method to execute immediately after the page or the file goes offline.
     * @param {function} func function to execute
     * @return {void}
     */
    off(func) {
        window.addEventListener("off", func);
    }

    /**
     * Starts the connection handler.
     * @return {void}
     */
    start() {
        this.ping();
        this.intervalID = setInterval(() => this.ping(), this.interval);
    }

    /**
     * Ends the running connection handler.
     * @return {void}
     */
    end() {
        window.clearInterval(this.intervalID);
    }

    /**
     * Sets the connection status to offline (without dispatching any event). If the page or file
     * goes back online or stay offline after the next ping, then the appropriate event will be
     * dispatched.
     * @return {void}
     */
    forceOffline() {
        this.isOnline = null;
    }

    /**
     * Pings the url or file set in the options, and sets the connection status accordingly. If a
     * change in the connection status is detected, then the proper event is dispatched.
     * @return {void}
     */
    ping() {
        if (!this.path) {
            throw new Error("Cannot ping an undefined path. Use setOptions to set a path.");
        }
        const httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    if (!this.isOnline) {
                        this.isOnline = true;
                        window.dispatchEvent(this.onEvent);
                    }
                } else if (this.isOnline || this.isOnline === null) {
                    this.isOnline = false;
                    window.dispatchEvent(this.offEvent);
                }
            }
        };
        httpRequest.open("GET", this.path, true);
        httpRequest.setRequestHeader("Content-Type", "application/json");
        httpRequest.timeout = this.timeout;
        httpRequest.send();
    }
}

window.connectionHandler = new Offline();
