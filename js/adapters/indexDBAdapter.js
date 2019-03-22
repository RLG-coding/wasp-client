"use strict";

/**
 * Class serving as an adapter between the application and IndexedDB
 * storage. Manages and returns tasks within the database.
 */
class IndexDBAdapter {
    /**
     * IndexedDB Database constructor.
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
            const request = window.indexedDB.open("todoDB", 1);

            request.onerror = event => {
                reject(event);
            };

            request.onsuccess = event => {
                this.db = event.target.result;
                resolve(event);
            };

            request.onupgradeneeded = event => {
                const db = event.target.result;

                const objectStore = db.createObjectStore("tasks", {keyPath: "id"});

                objectStore.transaction.oncomplete = event => {
                    showNotification("Local storage successfully upgraded!", "blue");
                };
            };
        });
    }

    /**
     * Adds the given task to the database.
     * @param {Task} task task to add
     * @return {void}
     */
    create(task) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction("tasks", "readwrite").objectStore("tasks").put(task);

            request.onerror = event => {
                reject(new Error("Failed to create task."));
            };

            request.onsuccess = event => {
                resolve(event);
            };
        });
    }

    /**
     * Returns the task corresponding to the given id (if it exists, returns null otherwise).
     * @param {uuid} id id to search for
     * @return {Task} corresponding task if it exists, null if not
     */
    read(id) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction("tasks", "readonly").objectStore("tasks").get(id);

            request.onerror = event => {
                reject(new Error("Failed to read task."));
            };

            request.onsuccess = event => {
                if (this.has(id)) {
                    resolve(request.result);
                } else {
                    resolve(null);
                }
            };
        });
    }

    /**
     * Returns a map containing all the tasks listed in the database.
     * @return {Map} map containing all the tasks in the database, using their ids as keys.
     */
    readAll() {
        return new Promise((resolve, reject) => {
            const list = new Map();
            const request = this.db.transaction("tasks").objectStore("tasks").getAll();

            request.onerror = event => {
                reject(new Error("Failed to load local database."));
            };

            request.onsuccess = event => {
                request.result.forEach(task => {
                    list.set(task.id, task);
                });
                resolve(list);
            };
        });
    }

    /**
     * Returns true if the given id is present exactly once in the database, false otherwise.
     * @param {uuid} id id to search for
     * @return {boolean} is the id given prsent in the database?
     */
    has(id) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction("tasks").objectStore("tasks").count(id);

            request.onerror = event => {
                reject(new Error("Failed to access tasks."));
            };

            request.onsuccess = event => {
                switch (request.result) {
                    case 1:
                        resolve(true);
                        break;
                    default:
                        resolve(false);
                }
            };
        });
    }

    /**
     * Updates an existing task with the given task within the database.
     * @param {Task} task updated task
     * @return {void}
     */
    update(task) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction("tasks", "readwrite").objectStore("tasks").put(task);

            request.onerror = event => {
                reject(new Error("Failed to update task."));
            };

            request.onsuccess = event => {
                resolve(event);
            };
        });
    }

    /**
     * Deletes the given tasks from the database.
     * @param {list} list list of tasks to delete
     * @return {void}
     */
    delete(list) {
        let request;
        const delPromises = [];
        for (const task of list) {
            delPromises.push(new Promise((resolve, reject) => {
                request = this.db.transaction("tasks", "readwrite").objectStore("tasks").delete(task.id);

                request.onerror = event => {
                    reject(new Error("Failed to delete task."));
                };

                request.onsuccess = event => {
                    resolve(event);
                };
            }));
        }

        return Promise.all(delPromises);
    }

    /**
     * Replaces all the tasks within the database with the ones given (the previous tasks will be lost).
     * @param {Map} newTasks Map containing all the new tasks
     * @return {void}
     */
    overwriteWith(newTasks) {
        let request;
        const tabPromises = [];
        const iterTasks = newTasks.values();

        // Clearing old database.
        tabPromises.push(new Promise((resolve, reject) => {
            request = this.db.transaction("tasks", "readwrite").objectStore("tasks").clear();

            request.onerror = event => {
                reject(event);
            };

            request.onsuccess = event => {
                resolve(event);
            };
        }));

        // Replacing database.
        newTasks.forEach(task => {
            tabPromises.push(new Promise((resolve, reject) => {
                request = this.db.transaction("tasks", "readwrite").objectStore("tasks").put(iterTasks.next().value);

                request.onerror = event => {
                    reject(event);
                };

                request.onsuccess = event => {
                    resolve(event);
                };
            }));
        });

        return Promise.all(tabPromises);
    }
}
