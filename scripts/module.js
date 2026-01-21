import { CampingGearConfig } from './config.js';
import { DeploymentManager } from './deployment-manager.js';
import { UIManager } from './ui-manager.js';

Hooks.once('init', () => {
  console.log('Camping Gear Deployment | Initializing');
  CampingGearConfig.registerSettings();
});

Hooks.once('ready', () => {
  console.log('Camping Gear Deployment | Ready');
});

Hooks.on('renderActorSheet', (app, html, data) => {
  UIManager.addDeployButtons(app, html, data);
});

Hooks.on('renderTileConfig', (app, html, data) => {
  UIManager.addPackButton(app, html, data);
});

Hooks.on('renderTileHUD', (hud, html, data) => {
  UIManager.addHUDButton(hud, html, data);
});

Hooks.on('getTileDirectoryEntryContext', (html, options) => {
  UIManager.addContextMenuOption(html, options);
});
