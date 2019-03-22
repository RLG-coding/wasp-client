/*global showNotification*/
"use strict";

/**
 * Class representing the entry point of the storage side of the application. Sends the tasks to store to the
 * appropriate adapters (depending on the browser and the state of the network connection) and ensures the local
 * and distant databases are always in sync.
 */
class Storage {
  /**
   * Storage constructor.
   * Sets up the storage methods which will be used: indexedDB or localStorage (locally) depending on the browser,
   * as well as a REST server if the client is connected to a network.
   * @return {void}
   */
  constructor() {
    if (!window.indexedDB) { this.adapter = new LocalAdapter(); } else { this.adapter = new IndexDBAdapter(); }
    this.requestDB = new RequestDB();
    this.emitter = () => {};

    window.connectionHandler.on(() => {
      try {
        this.setServer();
        this.synchronizeDatabases();
        showNotification("Connected to server: list synchronized!", "blue");
      } catch (err) {
        showNotification("Failed to synchronize the list.");
        console.log(err.message);
        window.connectionHandler.retry();
      }
    });
    window.connectionHandler.off(() => {
      showNotification("Cannot connect to server.");
    });
  }

  /**
   * Connects the web page to the storage pointed by the class parameter (and creates it if necessary).
   * @return {void}
   */
  connect() {
    return Promise.all([this.adapter.connect(), this.requestDB.connect()]);
  }

  /**
   * Connects to the server side and sets up the SSE connection between the client and the server.
   * @return {void}
   */
  setServer() {
    this.restAdapter = new RestAdapter();
    this.eventSource = new EventSource("https://todo-server.fabnum.intradef.gouv.fr:8443/api/v1/sse");
    this.eventSource.onmessage = event => {
      this.updateLocal(JSON.parse(event.data));
    };
  }

  /**
   * Adds the given task to local storage and distant storage (if online, sets the add request aside in a request
   * database otherwise).
   * @param {Task} task task to add
   * @return {void}
   */
  async create(task) {
    if (window.connectionHandler.isOnline) {
      await this.adapter.create(task);
      await this.restAdapter.create(task);
    } else {
      await this.adapter.create(task);
      await this.requestDB.push("add", task);
    }
  }

  /**
   * Returns the task corresponding to the given id (if it exists, returns null otherwise).
   * @param {uuid} id id to search for
   * @return {Task} corresponding task if it exists, null if not
   */
  read(id) {
    return this.adapter.read(id);
  }

  /**
   * Returns a map containing all the tasks listed in local storage.
   * @return {Map} map containing all the tasks in the database, using their ids as keys.
   */
  readAll() {
    return this.adapter.readAll();
  }

  /**
   * Updates an existing task with the given task within local storage and distant storage (if online, sets the
   * update request aside in a request database otherwise).
   * @param {Task} task updated task
   * @return {void}
   */
  async update(task) {
    if (window.connectionHandler.isOnline) {
      await this.adapter.update(task);
      await this.restAdapter.update(task);
    } else {
      await this.adapter.update(task);
      await this.requestDB.push("update", task);
    }
  }

  /**
   * Deletes the given tasks from local storage and distant storage (if online, sets the delete
   * request aside in a request database otherwise).
   * @param {list} list list of tasks to delete
   * @return {void}
   */
  async delete(list) {
    if (window.connectionHandler.isOnline) {
      await this.adapter.delete(list);
      await this.restAdapter.delete(list);
    } else {
      await this.adapter.delete(list);
      for (const task of list) { await this.requestDB.push("delete", task); }
    }
  }

  /**
   * Sets the emitter parameter to the given function.
   * @param {function} callback new emitter function
   * @return {void}
   */
  setDBEventFunction(callback) {
    this.emitter = callback;
  }

  /**
   * Synchronizes the local and distant databases, and clears the request database.
   * @return {void}
   */
  async synchronizeDatabases() {
    let action;
    let task;
    const requestList = await this.requestDB.listAll();
    for (const request of requestList) {
      action = request[0];
      task = request[1];
      switch (action) {
        case "add":
          await this.restAdapter.create(task);
          break;
        case "update":
          await this.restAdapter.update(task);
          break;
        case "delete":
          await this.restAdapter.delete([task]);
          break;
        default:
          showNotification("Unexpected action during syncronization.");
          break;
      }
    }

    const updatedList = await this.restAdapter.readAll();
    await this.adapter.overwriteWith(updatedList);
    this.emitter({action: "refresh", list: updatedList});
    this.requestDB.clear();
  }

  /**
   * Updates the local database depending on the content of the parameter data, after making sure the performing
   * the action given is necessary.
   * @param {Object} data modification to make inside the local database (action, task)
   * @param {string} data.action action to inside the local database
   * @param {Task} data.task task to add, update or delete
   * @return {void}
   */
  async updateLocal({action, task} = {}) {
    let oldTask;
    switch (action) {
      case "add":
        if (!await this.adapter.has(task.id)) {
          await this.adapter.create(task);
          this.emitter({action: "add", task});
        } else { return; }
        break;
      case "delete":
        if (await this.adapter.has(task.id)) {
          await this.adapter.delete([task]);
          this.emitter({action: "delete", task});
        } else { return; }
        break;
      case "update":
        oldTask = await this.adapter.read(task.id);
        if (oldTask.title !== task.title || oldTask.desc !== task.title) {
          await this.adapter.update(task);
          this.emitter({action: "update", task});
        } else { return; }
        break;
      default:
        showNotification("Unexpected action inside the database.");

        return;
    }
    showNotification("Remote changes detected: list updated!", "blue");
  }
}
