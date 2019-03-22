"use strict";

/**
 * Class serving as an adapter between the application and local
 * storage. Manages and returns tasks within the database.
 */
class LocalAdapter {
    /**
     * LocalStorage Object constructor.
     */
    constructor() {
        this.list = localStorage.getItem("list");
        this.list = this.list ? jsonToStrMap(this.list) : new Map();
    }

    /**
     * Resolves a promise (no need to connect to LocalStorage).
     * @return {void}
     */
    connect() {
        return Promise.resolve(true);
    }

    /**
     * Adds the given task to the list and saves it to LocalStorage.
     * @param {Task} task task to add
     * @return {void}
     */
    create(task) {
        this.list.set(task.id, task);
        localStorage.setItem("list", strMapToJson(this.list));

        return Promise.resolve(true);
    }

    /**
     * Returns the task corresponding to the given id (if it exists, returns null otherwise).
     * @param {uuid} id id to search for
     * @return {Task} corresponding task if it exists, null if not
     */
    read(id) {
        if (this.list.has(id)) {
            return Promise.resolve(this.list.get(id));
        }

        return Promise.resolve(null);
    }

    /**
     * Returns the map used as class parameter, containing all the tasks stored within LocalStorage.
     * @return {Map} map containing all the tasks in the database, using their ids as keys.
     */
    readAll() {
        return Promise.resolve(this.list);
    }

    /**
     * Returns true if the given id is present exactly once in the list, false otherwise.
     * @param {uuid} id id to search for
     * @return {boolean} is the id given prsent in the database?
     */
    has(id) {
        return this.list.has(id);
    }

    /**
     * Updates an existing task within the list and saves it to LocalStorage.
     * @param {Task} task updated task
     * @return {void}
     */
    update(task) {
        this.create(task);

        return Promise.resolve(true);
    }

    /**
     * Deletes the given tasks from the list as well as from LocalStorage.
     * @param {list} list list of tasks to delete
     * @return {void}
     */
    delete(list) {
        for (const task of list) {
            this.list.delete(task.id);
        }
        localStorage.setItem("list", strMapToJson(this.list));

        return Promise.resolve(true);
    }

    /**
     * Replaces all the tasks within LocalStorage with the ones given (the previous tasks will be lost).
     * @param {Map} newTasks Map containing all the new tasks
     * @return {void}
     */
    overwriteWith(newTasks) {
        this.list = newTasks;
        localStorage.setItem("list", strMapToJson(newTasks));

        return Promise.resolve(true);
    }
}
