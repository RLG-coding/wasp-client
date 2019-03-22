"use strict";

/**
 * Class in charge of storing and returning a list of requests
 * to perform on another database within a local database.
 */
class RequestDB {
    /**
     * Request database constructor.
     * @return {void}
     */
    constructor() {
        this.db = null;
    }

    /**
     * Creates the database if it doesn't exist already, or upgrades an existing database if needed.
     * @return {void}
     */
    connect() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open("requestDB", 1);

            request.onerror = event => {
                reject(event);
            };

            request.onsuccess = event => {
                this.db = event.target.result;
                resolve(event);
            };

            request.onupgradeneeded = event => {
                const db = event.target.result;

                const objectStore = db.createObjectStore("requests", {autoIncrement: true});

                objectStore.transaction.oncomplete = event => {
                };
            };
        });
    }

    /**
     * Adds a new request to the database.
     * @param {string} action action to perform for the request
     * @param {Task} task task to perform the request with
     * @return {void}
     */
    push(action, task) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction("requests", "readwrite").objectStore("requests").put([action, task]);

            request.onerror = event => {
                reject(event);
            };

            request.onsuccess = event => {
                resolve(event);
            };
        });
    }

    /**
     * Returns a list of all the elements stored inside the database.
     * @return {list} list of requests
     */
    listAll() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction("requests").objectStore("requests").getAll();

            request.onerror = event => {
                reject(event);
            };

            request.onsuccess = event => {
                resolve(request.result);
            };
        });
    }

    /**
     * Clears the database.
     * @return {void}
     */
    clear() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction("requests", "readwrite").objectStore("requests").clear();

            request.onerror = event => {
                reject(event);
            };

            request.onsuccess = event => {
                resolve(event);
            };
        });
    }
}
