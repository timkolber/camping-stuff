import { CampingGearConfig } from './config.js';

export class DeploymentManager {
  static async deployGear(actor, item, scene) {
    const quantity = CampingGearConfig.getQuantity(item);
    
    if (quantity <= 0) {
      ui.notifications.warn('No camping gear available to deploy');
      return null;
    }
    
    if (!actor.isOwner) {
      ui.notifications.error('You do not have permission to deploy this item');
      return null;
    }
    
    if (!scene) {
      ui.notifications.warn('No active scene to deploy camping gear');
      return null;
    }
    
    ui.notifications.info('Click to place. Use mouse wheel to rotate. Right-click to cancel.');
    
    try {
      const placement = await this.getPlacementData(item);
      if (!placement) return null;
      
      const tile = await this.createTile(actor, item, scene, placement);
      await CampingGearConfig.setQuantity(item, quantity - 1);
      
      ui.notifications.info(`${item.name} deployed on scene`);
      return tile;
    } catch (error) {
      console.error('Camping Gear Deployment | Error:', error);
      ui.notifications.error('Failed to deploy camping gear');
      return null;
    }
  }
  
  static async getPlacementData(item) {
    return new Promise((resolve, reject) => {
      let rotation = 0;
      let preview = null;
      const allowRotation = CampingGearConfig.getSetting(CampingGearConfig.SETTINGS.ALLOW_ROTATION);
      const rotationStep = CampingGearConfig.getSetting(CampingGearConfig.SETTINGS.ROTATION_STEP);
      
      const createPreview = (x, y) => {
        if (preview) preview.destroy();
        
        const sprite = new PIXI.Sprite(PIXI.Texture.from(item.img));
        const size = this.getTileSize();
        sprite.width = size;
        sprite.height = size;
        sprite.anchor.set(0.5);
        sprite.alpha = 0.6;
        sprite.x = x;
        sprite.y = y;
        sprite.angle = rotation;
        
        canvas.stage.addChild(sprite);
        return sprite;
      };
      
      const moveHandler = (event) => {
        const coords = canvas.canvasCoordinatesFromClient(event.data.origin);
        preview = createPreview(coords.x, coords.y);
      };
      
      const wheelHandler = (event) => {
        if (!allowRotation) return;
        event.preventDefault();
        rotation += event.deltaY > 0 ? -rotationStep : rotationStep;
        rotation = rotation % 360;
        if (preview) preview.angle = rotation;
      };
      
      const clickHandler = (event) => {
        if (event.data.button === 2) {
          cleanup();
          resolve(null);
          return;
        }
        
        const coords = canvas.canvasCoordinatesFromClient(event.data.origin);
        cleanup();
        resolve({ x: coords.x, y: coords.y, rotation });
      };
      
      const cleanup = () => {
        if (preview) {
          preview.destroy();
          preview = null;
        }
        canvas.stage.off('pointermove', moveHandler);
        canvas.stage.off('pointerdown', clickHandler);
        canvas.app.view.removeEventListener('wheel', wheelHandler);
      };
      
      canvas.stage.on('pointermove', moveHandler);
      canvas.stage.on('pointerdown', clickHandler);
      if (allowRotation) {
        canvas.app.view.addEventListener('wheel', wheelHandler, { passive: false });
      }
    });
  }
  
  static getTileSize() {
    const autoScale = CampingGearConfig.getSetting(CampingGearConfig.SETTINGS.AUTO_SCALE);
    if (autoScale && canvas.grid) {
      return canvas.grid.size;
    }
    return CampingGearConfig.getSetting(CampingGearConfig.SETTINGS.DEFAULT_SIZE);
  }
  
  static async createTile(actor, item, scene, placement) {
    const size = this.getTileSize();
    
    const tileData = {
      texture: {
        src: item.img || 'icons/sundries/survival/bedroll-brown.webp'
      },
      x: placement.x,
      y: placement.y,
      width: size,
      height: size,
      rotation: placement.rotation,
      flags: {
        [CampingGearConfig.MODULE_ID]: {
          isDeployed: true,
          actorId: actor.id,
          itemId: item.id,
          itemName: item.name
        }
      }
    };
    
    const tiles = await scene.createEmbeddedDocuments('Tile', [tileData]);
    return tiles[0];
  }
  
  static async packUpGear(tile) {
    const flags = tile.flags[CampingGearConfig.MODULE_ID];
    
    if (!flags?.isDeployed) {
      ui.notifications.warn('This is not a deployed camping gear item');
      return false;
    }
    
    const actor = game.actors.get(flags.actorId);
    if (!actor) {
      ui.notifications.error('Original actor not found');
      return false;
    }
    
    if (!actor.isOwner) {
      ui.notifications.error('You do not have permission to pack up this item');
      return false;
    }
    
    const item = actor.items.get(flags.itemId);
    if (!item) {
      ui.notifications.error('Original item not found in inventory');
      return false;
    }
    
    const quantity = CampingGearConfig.getQuantity(item);
    await CampingGearConfig.setQuantity(item, quantity + 1);
    await tile.delete();
    
    ui.notifications.info(`${flags.itemName} packed back into inventory`);
    return true;
  }
}
