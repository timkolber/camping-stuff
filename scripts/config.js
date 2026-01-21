export class CampingGearConfig {
  static MODULE_ID = 'camping-gear-deployment';
  
  static SETTINGS = {
    DEPLOYED_ITEMS: 'deployedItems',
    KEYWORDS: 'campingKeywords',
    DEFAULT_SIZE: 'defaultTileSize',
    ALLOW_ROTATION: 'allowRotation',
    ROTATION_STEP: 'rotationStep',
    SHOW_HUD_BUTTON: 'showHudButton',
    QUANTITY_FIELD: 'quantityField',
    AUTO_SCALE: 'autoScaleToGrid'
  };
  
  static registerSettings() {
    game.settings.register(this.MODULE_ID, this.SETTINGS.DEPLOYED_ITEMS, {
      scope: 'world',
      config: false,
      type: Object,
      default: {}
    });
    
    game.settings.register(this.MODULE_ID, this.SETTINGS.KEYWORDS, {
      name: 'Camping Gear Keywords',
      hint: 'Comma-separated list of keywords to identify camping gear items',
      scope: 'world',
      config: true,
      type: String,
      default: 'sleeping bag, tent, bedroll, campfire, camp',
      onChange: () => window.location.reload()
    });
    
    game.settings.register(this.MODULE_ID, this.SETTINGS.DEFAULT_SIZE, {
      name: 'Default Tile Size',
      hint: 'Default size in pixels for deployed camping gear',
      scope: 'world',
      config: true,
      type: Number,
      default: 200,
      range: {
        min: 50,
        max: 500,
        step: 10
      }
    });
    
    game.settings.register(this.MODULE_ID, this.SETTINGS.AUTO_SCALE, {
      name: 'Auto-scale to Grid',
      hint: 'Automatically scale deployed items to match grid size',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
    
    game.settings.register(this.MODULE_ID, this.SETTINGS.ALLOW_ROTATION, {
      name: 'Allow Rotation',
      hint: 'Allow rotating camping gear during placement',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
    
    game.settings.register(this.MODULE_ID, this.SETTINGS.ROTATION_STEP, {
      name: 'Rotation Step (degrees)',
      hint: 'How many degrees to rotate with each mouse wheel tick',
      scope: 'world',
      config: true,
      type: Number,
      default: 15,
      range: {
        min: 1,
        max: 90,
        step: 1
      }
    });
    
    game.settings.register(this.MODULE_ID, this.SETTINGS.SHOW_HUD_BUTTON, {
      name: 'Show HUD Pack Button',
      hint: 'Show pack-up button when hovering over deployed tiles',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
    
    game.settings.register(this.MODULE_ID, this.SETTINGS.QUANTITY_FIELD, {
      name: 'Quantity Field Path',
      hint: 'Data path to item quantity (e.g., system.quantity or data.quantity)',
      scope: 'world',
      config: true,
      type: String,
      default: 'system.quantity'
    });
  }
  
  static getSetting(key) {
    return game.settings.get(this.MODULE_ID, key);
  }
  
  static getKeywords() {
    const keywords = this.getSetting(this.SETTINGS.KEYWORDS);
    return keywords.split(',').map(k => k.trim().toLowerCase());
  }
  
  static isCampingGear(item) {
    const itemName = item.name.toLowerCase();
    const keywords = this.getKeywords();
    return keywords.some(keyword => itemName.includes(keyword));
  }
  
  static getQuantity(item) {
    const path = this.getSetting(this.SETTINGS.QUANTITY_FIELD);
    return foundry.utils.getProperty(item, path) || 0;
  }
  
  static async setQuantity(item, value) {
    const path = this.getSetting(this.SETTINGS.QUANTITY_FIELD);
    return await item.update({ [path]: value });
  }
}
