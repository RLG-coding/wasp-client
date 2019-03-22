"use strict";

$(document).ready(async() => {
    const modal = new Modal("#todoModal");
    const todo = new Todo("todo", modal);
    window.connectionHandler.setOptions({path: "https://todo-server.fabnum.intradef.gouv.fr:8443/api/v1"});
    window.connectionHandler.start();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js");
    } else {
        showNotification("Offline mode not supported.");
    }

    // Initial loading and display of the to-do list.
    await todo.initList().catch(err => {
        showNotification(err.message);
    });

    $(document).on("click", "#reload", event => {
        window.location.reload(false);
    });

    // When the "Add a task" button is pressed.
    $("#openModalButton").click(event => {
        event.preventDefault();
        modal.clear();
        $("#modalLabel").text("New task");
        modal.show();
    });

    // When the in-modal "Save" button is pressed.
    $(document).on("click", "#saveButton", modal, event => {
        event.preventDefault();
        const task = event.data.task;
        if (task.title) {
            todo.updateTodo(task).catch(err => {
                showNotification(err.message);
            });
        }
    });

    // When an entry is (un)selected.
    $(document).on("click", ".checkItem", event => {
        event.stopPropagation();
        onSelect();
    });

    // When the "Remove x item(s)" button is pressed.
    $(document).on("click", "#deleteButton", event => {
        event.preventDefault();
        const rowsToDelete = $(".checkItem:checked").parent().parent();
        rowsToDelete.each((index, row) => {
            todo.removeFromTodo($(row).data("todo")).catch(err => {
                showNotification(err.message);
            });
        });
    });

    // Upon double-clicking an entry.
    $(document).on("dblclick", ".tableEntry", modal, event => {
        event.preventDefault();
        const row = event.currentTarget;
        $("#modalLabel").text("View task");
        todo.displayInModal($(row).data("todo")).catch(err => {
            showNotification(err.message);
        });
    });

    $(document).on("click", "#secret", event => {
        darkMode();
    });
});

/**
 * Reveals the deletion option when at least one item is selected.
 * @return {void}
 */
function onSelect() {
    const selection = $(".checkItem:checked");
    const nbSelect = selection.length;
    const deleteDiv = $("#delete");
    if (nbSelect >= 1) {
        deleteDiv.html(`
            <div class="row justify-content-center">
                <button id="deleteButton" class="btn btn-danger">Remove ${nbSelect} item(s)</button>
            </div>`);
        deleteDiv.show();
    } else {
        deleteDiv.hide();
    }
}

/**
 * Activates that page's dark mode.
 * @return {void}
 */
function darkMode() {
    const wholePage = $("#wholePage");
    wholePage.on("transitionend webkitTransitionEnd", e => {
    });
    wholePage.addClass("goDark");
    $("table").addClass("table-dark");
    wholePage.addClass("dark");
}
