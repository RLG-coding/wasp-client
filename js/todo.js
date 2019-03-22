"use strict";

/**
 * Class representing the to-do list. Displays tasks
 * on the webpage and sends them to storage.
 */
class Todo {
    /**
     * To-do list constructor.
     * @param {string} name name of the to-do list
     * @param {Modal} modal modal used on the web page
     */
    constructor(name, modal) {
        this.name = name;
        this.modal = modal;
        this.storage = new Storage();
        this.networkStateChange(window.navigator.onLine);
        window.connectionHandler.on(() => { this.networkStateChange(true); });
        window.connectionHandler.off(() => { this.networkStateChange(false); });
    }

    /**
     * Prints the full class parameter 'list' on the web page.
     * @return {void}
     */
    async initList() {
        await this.storage.connect();
        this.storage.setDBEventFunction(data => this.updatePage(data));
        const tasks = await this.storage.readAll();
        tasks.forEach(task => {
            this.printOnPage(task);
        });
    }

    /**
     * Shows the title and description of an existing task inside the modal text box.
     * @param {Task.id} taskId id of the task to display
     * @return {void}
     */
    async displayInModal(taskId) {
        this.modal.task = await this.storage.read(taskId);
        this.modal.show();
    }


    /**
     * Updates the list parameter and the web page list by adding or editing a task (depending on the mode of the modal)
     * @param {Task} task task to add or edit
     * @return {void}
     */
    async updateTodo(task) {
        if (this.modal.isEdit()) {
            try {
                await this.storage.update(task);
            } catch (err) {
                window.connectionHandler.forceOffline();
                await this.storage.update(task);
            }
            this.editOnPage(task);
        } else {
            try {
                await this.storage.create(task);
            } catch (err) {
                window.connectionHandler.forceOffline();
                await this.storage.create(task);
            }
            this.printOnPage(task);
        }
    }

    /**
     * Removes a task from the list parameter and the web page list.
     * @param {Task.id} taskId id of the task to remove
     * @return {void}
     */
    async removeFromTodo(taskId) {
        const task = await this.storage.read(taskId);
        try {
            await this.storage.delete([task]);
        } catch (err) {
            window.connectionHandler.forceOffline();
            await this.storage.delete([task]);
        }
        this.eraseFromPage(task);
    }

    /**
     * Updates the page according to the action and data given.
     * @param {Object} data modification to make on the web page (action, task OR list)
     * @param {string} data.action action to perform on the web page (add, update, delete or refresh)
     * @param {Task} data.task task to add, update or delete (unused if action is to refresh)
     * @param {list} data.list list of tasks to replace the currently displayed to-do list with (unused
     * if action is to add, update or delete)
     * @return {void}
     */
    updatePage({action, task, list} = {}) {
        switch (action) {
            case "add":
                this.printOnPage(task);
                break;
            case "update":
                this.editOnPage(task);
                break;
            case "delete":
                this.eraseFromPage(task);
                break;
            case "refresh":
                this.refreshOnPage(list);
                break;
            default:
                showNotification("Unknown action on web page.");
                break;
        }
    }

    /**
     * Adds the necessary code to the webpage to display a new task in the to-do list.
     * @param {Task} task task to add
     * @return {void}
     */
    printOnPage(task) {
        $("#list tbody").append(`
            <tr data-todo="${task.id}" class="tableEntry">
                <td class="checkboxCell">
                    <input type="checkbox" class="checkItem" />
                </td>
                <td>${task.title}</td>
            </tr>`);
    }

    /**
     * Edits the code of the webpage to modify the text of an existing task in the to-do list.
     * @param {Task} task task to edit
     * @return {void}
     */
    editOnPage(task) {
        $(`tr[data-todo="${task.id}"] td:nth-child(2)`).text(task.title);
    }

    /**
     * Removes the necessary code from the webpage to delete an existing task in the to-do list. Also animates the action and hides the delete button after completion.
     * @param {Task} task task to remove
     * @return {void}
     */
    eraseFromPage(task) {
        const row = $(`tr[data-todo="${task.id}"]`);
        row.on("transitionend webkitTransitionEnd", e => {
            row.remove();
        });
        $("#delete").hide();
        row.addClass("deleted");
    }

    /**
     * Clears the current on-page to-do list and replace it with the one given.
     * @param {list} list new list of task to display
     * @return {void}
     */
    refreshOnPage(list) {
        $(`tr`).remove();
        list.forEach(task => {
            this.printOnPage(task);
        });
    }

    /**
     * Diplays the "wifi on" symbol when set to true, "wifi off" otherwise.
     * @param {boolean} isOnline state of the network to represent
     * @return {void}
     */
    networkStateChange(isOnline) {
        if (isOnline) {
            $("#wifi_off").addClass("d-none");
            $("#wifi_on").removeClass("d-none");
        } else {
            $("#wifi_on").addClass("d-none");
            $("#wifi_off").removeClass("d-none");
        }
    }
}
