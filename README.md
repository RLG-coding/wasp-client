.WASP. a Web Activity Storage Program.
___
.use.

Open index.html in a browser.
___
.about.

Wasp is a web app, developed in JavaScript, where users can manage a simple to-do list. Adding or editing tasks can be accomplished thanks to a pop-up window, and removing specific tasks is as simple as ticking the respective boxes and pressing the remove button. When online, the app uses a RESTful architecture as well as Node.JS and a MariaDB-powered server side to save tasks to a distant database so the data can be loaded from other devices and across browsers. When the user is offline, the website can still be accessed by making use of the browser's cache, and changes are saved inside the browser's database system (IndexDB) as long as the user remains offline. The requests are then immediately and automatically sent to the MariaDB database after the user reconnects to the server side again.

Wasp uses JQuery to manipulate the DOM and update the page in real time, even if the edits are made on another device, or changes were made while that user was offline. The app's elegant and responsive design, compatible with every recent browser and device, complete with a built-in notification banner system, ensures the best experience to the end user.