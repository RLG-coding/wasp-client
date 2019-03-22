"use strict";

/**
 * Class representing a task from a to-do list.
 */
class Task {
    /**
     * Task constructor.
     * @param {string} title title of the task
     * @param {string} desc description of the task
     * @param {uuid} id custom task id
     */
    constructor(title, desc, id) {
        this.title = title;
        this.desc = desc ? desc : "No description given.";
        this.id = id ? id : uuidv4(); // random id
    }
}
