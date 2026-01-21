import { CampingGearConfig } from './config.js';
import { DeploymentManager } from './deployment-manager.js';

export class UIManager {
  static addDeployButtons(app, html, data) {
    const items = html.find('.item');
    
    items.each((i, itemElement) => {
      const itemId = itemElement.dataset.itemId;
      const actor = app.actor;
      const item = actor.items.get(itemId);
      
      if (!item) return;
      
      const isCampingGear = CampingGearConfig.isCampingGear(item);
      const quantity = CampingGearConfig.getQuantity(item);
      
      if (isCampingGear && quantity > 0) {
        const controls = $(itemElement).find('.item-controls');
        if (controls.length && !controls.find('.deploy-gear').length) {
          controls.prepend(`
            <a class="item-control deploy-gear" title="Deploy on Scene">
              <i class="fas fa-campground"></i>
            </a>
          `);
        }
      }
    });
    
    html.find('.deploy-gear').click(async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const itemElement = $(event.currentTarget).closest('.item');
      const itemId = itemElement.data('item-id');
      const actor = app.actor;
      const item = actor.items.get(itemId);
      const scene = game.scenes.viewed;
      
      await DeploymentManager.deployGear(actor, item, scene);
    });
  }
  
  static addPackButton(app, html, data) {
    const tile = app.object;
    const flags = tile.flags[CampingGearConfig.MODULE_ID];
    
    if (!flags?.isDeployed) return;
    
    const packButton = $(`
      <button type="button" class="pack-gear">
        <i class="fas fa-box"></i> Pack Up ${flags.itemName}
      </button>
    `);
    
    html.find('button[type="submit"]').before(packButton);
    
    packButton.click(async (event) => {
      event.preventDefault();
      const success = await DeploymentManager.packUpGear(tile);
      if (success) app.close();
    });
  }
  
  static addHUDButton(hud, html, data) {
    const showHUD = CampingGearConfig.getSetting(CampingGearConfig.SETTINGS.SHOW_HUD_BUTTON);
    if (!showHUD) return;
    
    const tile = canvas.tiles.get(data._id);
    const flags = tile?.flags[CampingGearConfig.MODULE_ID];
    
    if (!flags?.isDeployed) return;
    
    const button = $(`
      <div class="control-icon pack-gear-hud" title="Pack up ${flags.itemName}">
        <i class="fas fa-box"></i>
      </div>
    `);
    
    html.find('.col.right').append(button);
    
    button.click(async (event) => {
      event.preventDefault();
      await DeploymentManager.packUpGear(tile);
      hud.clear();
    });
  }
  
  static addContextMenuOption(html, options) {
    options.push({
      name: 'Pack Up Gear',
      icon: '<i class="fas fa-box"></i>',
      condition: (li) => {
        const tile = game.scenes.current?.tiles.get(li.data('documentId'));
        return tile?.flags[CampingGearConfig.MODULE_ID]?.isDeployed;
      },
      callback: (li) => {
        const tile = game.scenes.current.tiles.get(li.data('documentId'));
        DeploymentManager.packUpGear(tile);
      }
    });
  }
}
