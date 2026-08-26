import Phaser from 'phaser';

export class OfficeScene extends Phaser.Scene {
  private characters: { [key: string]: Phaser.GameObjects.Container } = {};
  private speechBubbles: { [key: string]: Phaser.GameObjects.Container } = {};
  private serverLights: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload() {
    // Generate procedural pixel textures
    this.createProceduralTextures();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 1. Draw Office Floor (Soft Sage Green Tile Grid)
    this.drawFloor(width, height);

    // 2. Draw Office Rooms & Walls
    this.drawWallsAndRooms(width, height);

    // 3. Draw Furniture & Desks
    this.drawFurniture();

    // 4. Create Animated Characters
    this.createCharacters();

    // 5. Setup Animated Server Lights
    this.time.addEvent({
      delay: 350,
      callback: this.blinkServerLights,
      callbackScope: this,
      loop: true,
    });

    // Listen for agent speech events from React
    this.game.events.on('agent-speak', this.handleAgentSpeech, this);
  }

  private createProceduralTextures() {
    // Floor Tile Texture
    const floorGfx = this.make.graphics({ x: 0, y: 0 });
    floorGfx.fillStyle(0x769b8b, 1); // Sage green base
    floorGfx.fillRect(0, 0, 32, 32);
    floorGfx.lineStyle(1, 0x678a7b, 0.6);
    floorGfx.strokeRect(0, 0, 32, 32);
    floorGfx.generateTexture('floor_tile', 32, 32);
  }

  private drawFloor(w: number, h: number) {
    for (let x = 0; x < w; x += 32) {
      for (let y = 0; y < h; y += 32) {
        this.add.image(x, y, 'floor_tile').setOrigin(0, 0);
      }
    }
  }

  private drawWallsAndRooms(w: number, h: number) {
    const gfx = this.add.graphics();

    // Outer Walls & Room Dividers
    gfx.fillStyle(0xffffff, 1); // White office partition walls
    gfx.fillRect(20, 20, 280, 10);  // Conference top wall
    gfx.fillRect(20, 20, 10, 180); // Conference left wall
    gfx.fillRect(20, 200, 280, 10); // Conference bottom wall
    gfx.fillRect(300, 20, 10, 190); // Conference right wall

    // Divider walls in main hall
    gfx.fillStyle(0xdddddd, 1);
    gfx.fillRect(60, 260, 180, 14); // Middle row divider
    gfx.fillRect(60, 420, 180, 14); // Bottom row divider

    // Server Room (Bottom Right)
    gfx.fillStyle(0x404856, 1);
    gfx.fillRect(360, 380, 120, 90);
    gfx.lineStyle(2, 0x2b3240, 1);
    gfx.strokeRect(360, 380, 120, 90);

    // Conference Room Signboard
    const confBox = this.add.graphics();
    confBox.fillStyle(0x3e526a, 1);
    confBox.fillRoundedRect(35, 30, 85, 24, 4);
    confBox.lineStyle(1, 0x5d7594, 1);
    confBox.strokeRoundedRect(35, 30, 85, 24, 4);
    this.add.text(77, 42, 'CONFERENCE\n   ROOM', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Server Room Signboard
    this.add.text(420, 425, 'SERVER\n ROOM', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#00ffcc',
    }).setOrigin(0.5);
  }

  private drawFurniture() {
    const gfx = this.add.graphics();

    // 1. Conference Table & Executive Chairs
    gfx.fillStyle(0xa65b4c, 1); // Wood table
    gfx.fillRoundedRect(100, 80, 130, 60, 8);
    gfx.lineStyle(2, 0x7a3a2d, 1);
    gfx.strokeRoundedRect(100, 80, 130, 60, 8);

    // Chairs around table
    const chairCoords = [
      [115, 65], [145, 65], [175, 65], [205, 65],
      [115, 150], [145, 150], [175, 150], [205, 150],
    ];
    chairCoords.forEach(([cx, cy]) => {
      gfx.fillStyle(0x8a2323, 1); // Red executive fabric
      gfx.fillRoundedRect(cx, cy, 20, 16, 3);
    });

    // Potted plant in conference room
    this.drawPlant(245, 45);

    // Water cooler
    this.drawWaterCooler(345, 30);
    this.drawWaterCooler(330, 410);

    // 2. Open Workstations (Left Column & Center)
    const deskRows = [
      // Left side desks
      [45, 280], [105, 280], [165, 280], [225, 280],
      [45, 380], [105, 380], [165, 380], [225, 380],
      // Right side desks
      [340, 50], [380, 50],
      [270, 180], [270, 360],
    ];

    deskRows.forEach(([dx, dy]) => {
      this.drawWorkstationDesk(dx, dy);
    });

    // Server racks in server room
    for (let r = 0; r < 3; r++) {
      gfx.fillStyle(0x1a1e28, 1);
      gfx.fillRect(375 + r * 32, 400, 24, 40);
      gfx.lineStyle(1, 0x2e384d, 1);
      gfx.strokeRect(375 + r * 32, 400, 24, 40);

      // Server LED lights
      const lightGfx = this.add.graphics();
      this.serverLights.push(lightGfx);
    }
  }

  private drawWorkstationDesk(x: number, y: number) {
    const gfx = this.add.graphics();

    // Wooden desk
    gfx.fillStyle(0xd49b4b, 1);
    gfx.fillRoundedRect(x, y, 38, 26, 4);
    gfx.lineStyle(1, 0x9c6c28, 1);
    gfx.strokeRoundedRect(x, y, 38, 26, 4);

    // Computer Monitor
    gfx.fillStyle(0x111111, 1);
    gfx.fillRect(x + 10, y + 4, 18, 12);
    gfx.fillStyle(0x00cfff, 0.8); // Screen glow
    gfx.fillRect(x + 12, y + 6, 14, 8);

    // Keyboard
    gfx.fillStyle(0x444444, 1);
    gfx.fillRect(x + 12, y + 18, 14, 4);

    // Office Chair
    gfx.fillStyle(0xda822a, 1);
    gfx.fillCircle(x + 19, y + 36, 9);
    gfx.lineStyle(1, 0x8a4b08, 1);
    gfx.strokeCircle(x + 19, y + 36, 9);
  }

  private drawPlant(x: number, y: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(0x9c5d33, 1); // Pot
    gfx.fillRoundedRect(x, y + 10, 16, 14, 3);
    gfx.fillStyle(0x2d8a4e, 1); // Leaves
    gfx.fillCircle(x + 8, y + 6, 10);
    gfx.fillCircle(x + 4, y + 10, 8);
    gfx.fillCircle(x + 12, y + 10, 8);
  }

  private drawWaterCooler(x: number, y: number) {
    const gfx = this.add.graphics();
    gfx.fillStyle(0xe5ebf2, 1); // Cooler base
    gfx.fillRect(x, y + 14, 16, 22);
    gfx.fillStyle(0x00cfff, 0.7); // Water bottle
    gfx.fillRoundedRect(x + 2, y, 12, 16, 4);
  }

  private blinkServerLights() {
    this.serverLights.forEach((gfx, idx) => {
      gfx.clear();
      for (let i = 0; i < 4; i++) {
        const color = Math.random() > 0.4 ? 0x00ff41 : (Math.random() > 0.5 ? 0x00cfff : 0xff4444);
        gfx.fillStyle(color, 1);
        gfx.fillRect(378 + idx * 32, 404 + i * 8, 4, 3);
      }
    });
  }

  private createCharacters() {
    // 1. Merchant Admin (In Conference Room)
    this.characters['MERCHANT_ADMIN'] = this.createPixelCharacter(55, 110, 'Merchant Admin', 0x995533, 0x883322);

    // 2. Sales Agent Michael (Right of hallway)
    this.characters['SALES_AGENT'] = this.createPixelCharacter(245, 120, 'Sales Agent', 0x222222, 0x00cc44, true);

    // 3. Customer (Center walkway)
    this.characters['CUSTOMER'] = this.createPixelCharacter(290, 200, 'Customer', 0x3366cc, 0x2255aa);

    // 4. Authority Agent (Bottom center station)
    this.characters['AUTHORITY_AGENT'] = this.createPixelCharacter(270, 360, 'Authority Agent', 0x1a1a1a, 0x9933ff);

    // 5. Merchant Agent (Near server room entrance)
    this.characters['MERCHANT_AGENT'] = this.createPixelCharacter(340, 370, 'Merchant Agent', 0x2b4f73, 0xdda433);
  }

  private createPixelCharacter(x: number, y: number, name: string, shirtColor: number, pantColor: number, isOnline = false): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const gfx = this.add.graphics();

    // Shadow
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(0, 16, 20, 8);

    // Body / Legs
    gfx.fillStyle(pantColor, 1);
    gfx.fillRect(-6, 6, 5, 10);
    gfx.fillRect(1, 6, 5, 10);

    // Shirt / Torso
    gfx.fillStyle(shirtColor, 1);
    gfx.fillRect(-8, -4, 16, 12);

    // Head / Face
    gfx.fillStyle(0xffd8b3, 1); // Skin tone
    gfx.fillCircle(0, -10, 8);

    // Hair
    gfx.fillStyle(0x3a2010, 1);
    gfx.fillCircle(0, -14, 8);
    gfx.fillRect(-8, -16, 16, 6);

    // Eyes
    gfx.fillStyle(0x111111, 1);
    gfx.fillRect(-4, -11, 2, 2);
    gfx.fillRect(2, -11, 2, 2);

    container.add(gfx);

    // Status Badge Box Below Character
    const badge = this.add.graphics();
    badge.fillStyle(0x111622, 0.9);
    badge.fillRoundedRect(-36, 18, 72, 16, 3);
    badge.lineStyle(1, isOnline ? 0x00ff41 : 0x3b82f6, 0.8);
    badge.strokeRoundedRect(-36, 18, 72, 16, 3);
    container.add(badge);

    const label = this.add.text(0, 26, name, {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    container.add(label);

    // Speech Bubble Container
    const bubbleContainer = this.add.container(0, -42);
    bubbleContainer.setVisible(false);

    const bubbleBg = this.add.graphics();
    bubbleBg.fillStyle(0xffffff, 0.98);
    bubbleBg.fillRoundedRect(-75, -20, 150, 34, 6);
    bubbleBg.lineStyle(1.5, 0x1e293b, 1);
    bubbleBg.strokeRoundedRect(-75, -20, 150, 34, 6);

    // Pointer triangle
    bubbleBg.fillTriangle(0, 14, -6, 20, 6, 14);

    const bubbleText = this.add.text(0, -4, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#0f172a',
      wordWrap: { width: 135 },
      align: 'center',
    }).setOrigin(0.5);

    bubbleContainer.add([bubbleBg, bubbleText]);
    container.add(bubbleContainer);

    this.speechBubbles[name] = bubbleContainer;

    return container;
  }

  public handleAgentSpeech(data: { agent: string; text: string }) {
    const agentMap: { [key: string]: string } = {
      SALES_AGENT: 'Sales Agent',
      MERCHANT_AGENT: 'Merchant Agent',
      AUTHORITY_AGENT: 'Authority Agent',
      CUSTOMER: 'Customer',
      MERCHANT_ADMIN: 'Merchant Admin',
    };

    const targetName = agentMap[data.agent] || 'Sales Agent';
    const bubble = this.speechBubbles[targetName];
    if (bubble) {
      const textObj = bubble.getAt(1) as Phaser.GameObjects.Text;
      if (textObj) {
        textObj.setText(data.text.slice(0, 45) + (data.text.length > 45 ? '...' : ''));
      }
      bubble.setVisible(true);
      bubble.setAlpha(1);

      this.tweens.add({
        targets: bubble,
        alpha: 0,
        delay: 3500,
        duration: 500,
        onComplete: () => bubble.setVisible(false),
      });
    }
  }
}
