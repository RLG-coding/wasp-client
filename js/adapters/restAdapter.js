"use strict";

/**
 * Class serving as an adapter between the application and distant storage on a server.
 * Sends requests to the server and returns the results from those requests.
 */
class RestAdapter {
    /**
     * Rest adapter constructor. Sets server url.
     */
    constructor() {
        this.url = "https://todo-server.fabnum.intradef.gouv.fr:8443/api/v1";
        this.requestDB = new RequestDB();
    }

    /**
     * Resolves a promise (no need to initialize the database).
     * @return {void}
     */
    connect() {
        return Promise.resolve(true);
    }

    /**
     * Adds the given task to the database.
     * @param {Task} task task to add
     * @return {void}
     */
    create(task) {
        return new Promise((resolve, reject) => {
            const httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 201) {
                        resolve(true);
                    } else {
                        reject(new Error("Creation request could not be processed in time."));
                    }
                }
            };
            httpRequest.open("POST", `${this.url}/tasks`, true);
            httpRequest.setRequestHeader("Content-Type", "application/json");
            httpRequest.timeout = 1500;
            httpRequest.send(JSON.stringify({task}));
        });
    }

    /**
     * Returns the task corresponding to the given id (if it exists, returns null otherwise).
     * @param {uuid} id id to search for
     * @return {Task} corresponding task if it exists, null if not
     */
    read(id) {
        return new Promise((resolve, reject) => {
            const httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
                        resolve(JSON.parse(httpRequest.responseText));
                    } else {
                        reject(new Error("Reading request could not be processed in time."));
                    }
                }
            };
            httpRequest.open("GET", `${this.url}/tasks/${id}`, true);
            httpRequest.setRequestHeader("Content-Type", "application/json");
            httpRequest.timeout = 1500;
            httpRequest.send();
        });
    }

    /**
     * Returns a map containing all the tasks listed in the database.
     * @return {Map} map containing all the tasks in the database, using their ids as keys.
     */
    readAll() {
        return new Promise((resolve, reject) => {
            const httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
                        resolve(jsonToStrMap(httpRequest.responseText));
                    } else {
                        reject(new Error("Selection request could not be processed."));
                    }
                }
            };
            httpRequest.open("GET", `${this.url}/tasks`, true);
            httpRequest.setRequestHeader("Content-Type", "application/json");
            httpRequest.timeout = 10000;
            httpRequest.send();
        });
    }

    /**
     * Updates an existing task with the given task within the database.
     * @param {Task} task updated task
     * @return {void}
     */
    update(task) {
        return new Promise((resolve, reject) => {
            const httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = () => {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
                        resolve(true);
                    } else {
                        reject(new Error("Update request could not be processed time."));
                    }
                }
            };
            httpRequest.open("PUT", `${this.url}/tasks/${task.id}`, true);
            httpRequest.setRequestHeader("Content-Type", "application/json");
            httpRequest.timeout = 1500;
            httpRequest.send(JSON.stringify({task}));
        });
    }

    /**
     * Deletes the given tasks from the database.
     * @param {list} list list of tasks to delete
     * @return {void}
     */
    delete(list) {
        const delPromises = [];
        for (const task of list) {
            delPromises.push(new Promise((resolve, reject) => {
                const httpRequest = new XMLHttpRequest();
                httpRequest.onreadystatechange = () => {
                    if (httpRequest.readyState === XMLHttpRequest.DONE) {
                        if (httpRequest.status === 200) {
                            resolve(true);
                        } else {
                            reject(new Error("Deletion request could not be processed time."));
                        }
                    }
                };
                httpRequest.open("DELETE", `${this.url}/tasks/${task.id}`, true);
                httpRequest.setRequestHeader("Content-Type", "application/json");
                httpRequest.timeout = 1500;
                httpRequest.send();
            }));
        }

        return Promise.all(delPromises);
    }
}
