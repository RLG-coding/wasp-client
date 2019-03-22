"use strict";

/**
 * Class representing a modal component on the web page.
 */
class Modal {
    /**
     * Modal constructor.
     * @param {string} id id of the modal box
     * @param {Task} task task to display in the modal's textbox
     */
    constructor(id, task) {
        this.modalId = $(id);
        this._task = task;
        this.edit = false;
    }

    /**
     * Tells the to-do list update function if the modal is in edit mode or not.
     * @return {boolean} true if in edit mode, false if not
     */
    isEdit() {
        return this.edit;
    }

    /**
     * Reveals the modal box.
     * @return {void}
     */
    show() {
        this.modalId.modal("show");
    }

    /**
     * Hides the modal box.
     * @return {void}
     */
    hide() {
        this.modalId.modal("hide");
    }

    /**
     * Sets task, display the text of this task in the modal's textbox and sets the modal into edit mode.
     * @param {Task} task task to appear inside the modal textbox
     * @return {void}
     */
    set task(task) {
        this._task = task;
        $("#textboxModal").val(`${task.title}\n${task.desc}`);
        this.edit = true;
    }

    /**
     * Reads the text in the modal box and updates the class parameter 'task' (if defined, creates a new task otherwise)
     * @return {void}
     */
    get task() {
        const item = $("#textboxModal").val().split("\n", 2);
        if (this._task) {
            this._task.title = item[0];
            this._task.desc = item[1];
        } else {
            this._task = new Task(item[0], item[1]);
        }

        return this._task;
    }

    /**
     * Empties the modal's textbox and resets the modal's parameters.
     * @return {void}
     */
    clear() {
        $("#textboxModal").val("");
        this.edit = false;
        this._task = null;
    }
}
