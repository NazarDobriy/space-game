import { Application } from 'pixi.js';
const app = new Application();
await app.init({
    resizeTo: window,
    backgroundColor: 0x30C790,
});
document.body.appendChild(app.canvas);
