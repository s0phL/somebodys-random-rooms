import './style.css'
import "./utility.js";
import "./fetchData.js";
import { openBookshelfUI } from './book.js'
import { openBoardUI } from './board.js'
import { openInfoUI } from './info.js'
import Phaser from 'phaser'

const sizes = {
  width: 500,
  height: 500,
};

const speedDown = 300;

let gameScene;

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 50;
    this.bookshelf;
    this.board;
    this.bgMusic;
  }

  preload() {
    this.load.image("bg", "/assets/backgrounds/bg.png");
    this.load.image("bg-2", "/assets/backgrounds/bg-2.png");
    this.load.image("player", "/assets/sprites/player.png");
    this.load.image("bookshelf", "/assets/sprites/bookshelf.png");
    this.load.image("board", "/assets/sprites/board.png");
    this.load.image("desk", "/assets/sprites/desk.png");
    this.load.image("computer-1", "/assets/sprites/computer-1.png");
    this.load.image("computer-2", "/assets/sprites/computer-2.png");
    this.load.image("easel", "/assets/sprites/easel.png");
    this.load.image("info", "/assets/sprites/info.png");

    this.load.image("fridge", "/assets/sprites/fridge.png");
    this.load.image("oven", "/assets/sprites/oven.png");
    this.load.image("cupboard", "/assets/sprites/cupboard.png");
    this.load.image("cupboard-long", "/assets/sprites/cupboard-long.png");
    this.load.image("cupboard-sink", "/assets/sprites/cupboard-sink.png");

    this.load.image("indicator", "/assets/sprites/indicator.png");

    this.load.audio("bgMusic", "/assets/sounds/Where-the-Blue-Moon-Weed-Grows.mp3"); 
  }

  createStaticObject(object, x, y, scale) {
    const obj = this.physics.add.staticImage(x, y, object)
      .setOrigin(0,0)
      .setScale(scale);
    obj.body.allowGravity = false;
    obj.refreshBody?.();
    return obj;
  }

  makeInteractive(obj, scale = 0.05) {
    obj.setInteractive({ useHandCursor: true });

    obj.on("pointerover", () => obj.setScale(scale + 0.005));
    obj.on("pointerout", () => obj.setScale(scale));
  }

  removeItems() {
    [
      this.indicator, 
      this.bookshelf, 
      this.board, 
      this.desk, 
      this.computer, 
      this.computer2, 
      this.easel,
      this.info,

      this.fridge,
      this.oven,
      this.cupboard,
      this.cupboardLong,
      this.cupboardSink
    ].forEach(obj => obj?.destroy());
  }

  switchRoom(targetRoom, enteredFrom) {
    const roomConfig = this.rooms[targetRoom];

    // change background
    this.bg.destroy();
    this.bg = this.add.image(0, 0, roomConfig.bg).setOrigin(0, 0).setScale(0.17);

    // reset items
    this.removeItems();

    this.currentRoom = targetRoom;

    if (enteredFrom === "left") {
      this.player.setCollideWorldBounds(false);
      this.player.setX(sizes.width - this.player.displayWidth - 1);
    } else if (enteredFrom === "right") {
      this.player.setCollideWorldBounds(false);
      this.player.setX(1);
    }
  }

  // Add objects and their interactions for room 1
  loadBg1() {
    // create objects and set positions
    this.bookshelf = this.createStaticObject("bookshelf", sizes.width/3, sizes.height/3, 0.05);
    this.board = this.createStaticObject("board", 0, 0, 0.05);
    this.desk = this.createStaticObject("desk", 0, 0, 0.045);
    this.computer = this.createStaticObject("computer-1", 0, 0, 0.04);
    this.computer2 = this.createStaticObject("computer-2", 0, 0, 0.05);
    this.easel = this.createStaticObject("easel", 0, 0, 0.065);
    this.info = this.createStaticObject("info", 0, 0, 0.05);

    this.board.setPosition(
      this.bookshelf.x + 2,
      this.bookshelf.y - this.board.displayHeight - 10
    ).refreshBody();

    this.desk.setPosition(
      this.bookshelf.x - this.desk.displayWidth - 10,
      this.bookshelf.y + this.bookshelf.displayHeight - this.desk.displayHeight
    ).refreshBody();

    this.computer.setPosition(
      this.desk.x + this.desk.displayWidth/2 - this.computer.displayWidth/2,
      this.desk.y - this.computer.displayHeight
    ).refreshBody();

    this.computer2.setPosition(
      this.desk.x + this.desk.displayWidth/2,
      this.desk.y + this.desk.displayHeight + this.computer2.displayHeight
    ).refreshBody();

    this.easel.setPosition(
      this.bookshelf.x + this.bookshelf.displayWidth + 60,
      this.bookshelf.y + this.bookshelf.displayHeight - 10
    ).refreshBody();

    this.info.setPosition(
      this.bookshelf.x + this.bookshelf.displayWidth + 40,
      this.bookshelf.y - 20
    ).setDepth(0).refreshBody();

    // add colliders
    [this.bookshelf, this.board, this.desk, this.computer, this.computer2, this.easel].forEach(obj => {
      this.physics.add.collider(this.player, obj);
    });

    // add popup text and interactions
    this.bookshelf.popupText = "A bookshelf full of books";
    this.bookshelf.onEnter = () => openBookshelfUI();

    this.board.popupText = "A collection of images tacked to a board";
    this.board.onEnter = () => openBoardUI();

    this.info.popupText = "A list of notes"
    this.info.onEnter = () => openInfoUI();

    this.desk.popupText = "A random desk";
    this.computer.popupText = "An old computer";
    this.computer2.popupText = "A computer monitor dumped on the floor with no purpose whatsoever, but the developer wanted to show it off because she put time into making it look nice";
    this.easel.popupText = "An easel of an aspiring, delusional artist"

    this.interactables = [
      this.bookshelf,
      this.board,
      this.desk,
      this.computer,
      this.computer2,
      this.easel,
      this.info
    ];

    this.makeInteractive(this.bookshelf, 0.05);
    this.makeInteractive(this.board, 0.05);
    this.makeInteractive(this.info, 0.05);

    this.bookshelf.on("pointerdown", () => {
      openBookshelfUI();
      this.bookshelf.setScale(0.05);
    });

    this.board.on("pointerdown", () => {
      openBoardUI();
      this.board.setScale(0.05);
    });

    this.info.on("pointerdown", () => {
      openInfoUI();
      this.info.setScale(0.05);
    });

    // indicator for interactables -- add last to ensure it appears on top
    this.indicator = this.add.image(0, 0, "indicator")
      .setOrigin(0.5, 1) // so it points above the object nicely
      .setScale(0.01)
      .setVisible(false);
  }

  // Add objects and their interactions for room 2
  loadBg2() {
    // create objects and set positions
    this.fridge = this.createStaticObject("fridge", sizes.width/2.5, sizes.height/4, 0.06);
    this.oven = this.createStaticObject("oven", 0, 0, 0.05);
    this.cupboard = this.createStaticObject("cupboard", 0, 0, 0.045);
    this.cupboardLong = this.createStaticObject("cupboard-long", 0, 0, 0.045);
    this.cupboardSink = this.createStaticObject("cupboard-sink", 0, 0, 0.045);

    this.oven.setPosition(
      this.fridge.x - this.oven.displayWidth - 10,
      this.fridge.y + this.fridge.displayHeight - this.oven.displayHeight
    ).refreshBody();

    this.cupboard.setPosition(
      this.oven.x,
      this.oven.y - this.cupboard.displayHeight - 20 
    ).refreshBody();

    this.cupboardLong.setPosition(
      this.cupboard.x - this.cupboardLong.displayWidth + 1,
      this.cupboard.y
    ).refreshBody();

    this.cupboardSink.setPosition(
      this.oven.x - this.cupboardSink.displayWidth,
      this.oven.y + this.oven.displayHeight - this.cupboardSink.displayHeight,
    ).refreshBody();

    // add colliders
    [this.fridge, this.oven, this.cupboard, this.cupboardLong, this.cupboardSink].forEach(obj => {
      this.physics.add.collider(this.player, obj);
    });

    // add popup text and interactions
    this.interactables = [
      this.fridge,
      this.oven,
    ];

    // indicator for interactables -- add last to ensure it appears on top
    this.indicator = this.add.image(0, 0, "indicator")
      .setOrigin(0.5, 1) // so it points above the object nicely
      .setScale(0.01)
      .setVisible(false);
  }

  create() {

    gameScene = this;

    //this.scene.pause("scene-game");

    this.bgMusic = this.sound.add("bgMusic");
    this.bgMusic.play({loop:true, volume:0.4});

    this.bg = this.add.image(0,0,"bg").setOrigin(0,0)
      .setScale(0.17);

    this.player = this.physics.add
      .image(10,sizes.height-100,"player").setOrigin(0,0)
      .setScale(0.05);
      // .setScale(0.03);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
    this.player.refreshBody();
    this.player.setDepth(1);

    this.loadBg1();


    this.rooms = {
      1: { bg: "bg", leftExit: true, rightExit: false },
      2: { bg: "bg-2", leftExit: false, rightExit: true },
    };
    this.currentRoom = 1;


    // set up user input
    this.cursor = this.input.keyboard.createCursorKeys();

    // WASD support
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
  }

  update() {
    // handle player movement
    const {left, right, up, down} = this.cursor;

    this.player.setVelocity(0);

    if (left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    }
    if (right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }
    if (up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    }
    if (down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // check for room exits
    if (this.currentRoom === 1 && this.player.x <= 0) {
      this.switchRoom(2, "left");
      this.loadBg2();
      this.player.setCollideWorldBounds(true);
    } else if (this.currentRoom === 2 && this.player.x + this.player.displayWidth >= sizes.width) {
      this.switchRoom(1, "right");
      this.loadBg1();
      this.player.setCollideWorldBounds(true);
    }

    // check for interactable objects (if within range)
    this.currentInteractable = null;

    this.interactables.forEach(obj => {
      // get player and object bounds
      const playerBounds = this.player.getBounds();
      const objBounds = obj.getBounds();

      // check for overlap using Phaser's rectangle intersection
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, objBounds)) {
        this.currentInteractable = obj;
      }
    });

    if (this.currentInteractable && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.popupOpen) {
        // popup is already open, trigger the object's UI
        this.currentPopupObject?.onEnter?.();
        this.closeMiniPopup();
      } 
      else {
        this.openMiniPopup(this.currentInteractable);
      }
    }

    if (this.currentInteractable) {
      // show indicator above the object
      this.indicator.setVisible(true);
      this.indicator.setPosition(
          this.currentInteractable.x + this.currentInteractable.displayWidth / 2,
          this.currentInteractable.y - 5
      );
    }
    else {
      this.indicator.setVisible(false);
    }

  }

  // Open a mini popup with text about the object, 
  // and trigger the object's onEnter action when the popup is clicked. 
  // The popup can be closed by clicking outside of it or pressing ESC.
  openMiniPopup(obj) {
    if (this.popupOpen) return; // only one popup at a time
    
    this.popupOpen = true;
    this.currentPopupObject = obj;

    const popupWidth = sizes.width * 0.6;
    const popupHeight = sizes.height * 0.3;
    const popupX = sizes.width / 2;
    const popupY = sizes.height / 2;

    // semi-transparent overlay
    this.popupBg = this.add.rectangle(
        popupX, popupY, sizes.width, sizes.height, 0x000000, 0.1
    ).setOrigin(0.5);

    // main popup box
    this.popupBox = this.add.rectangle(
        popupX, popupY, popupWidth, popupHeight, 0x222222, 0.9
    ).setOrigin(0.5);
    this.popupBox.setStrokeStyle(1, 0xffffff);

    let fontSize = Math.min(20, Math.floor(popupHeight / 6));
    const style = {
      font: `${fontSize}px Arial`,
      fill: "#ffffff",
      wordWrap: { width: popupWidth * 0.9, useAdvancedWrap: true },
      align: "center"
    };

    this.popupText = this.add.text(
      popupX, popupY,
      obj.popupText || "The developer was too lazy to write a popup text for this object",
      style
    ).setOrigin(0.5);

    // add an upside-down triangle (▼) at the bottom-right corner of the popup box
    const triangleSize = 10;
    const offsetX = -15;
    const offsetY = -20;
    const popupRight = popupX + popupWidth / 2;
    // const popupBottom = popupY + popupHeight / 2;

    this.popupTriangle = this.add.graphics({ fillStyle: { color: 0xffffff } }); // white fill
    this.popupTriangle.fillTriangle(
        popupRight - triangleSize/2 + offsetX, popupY + popupHeight/2 + offsetY,  // left corner of triangle
        popupRight + triangleSize/2 + offsetX, popupY + popupHeight/2 + offsetY, // right corner
        popupRight + offsetX, popupY + popupHeight/2 + triangleSize + offsetY   // bottom tip
    );

    this.popupContainer = this.add.container(0, 0, [
      this.popupBg,
      this.popupBox,
      this.popupText,
      this.popupTriangle
    ]).setDepth(10);

    // close on click (inside box)
    this.popupBox.setInteractive();
    this.popupBox.on("pointerdown", (pointer) => {
        obj.onEnter?.(); // call optional action
        this.closeMiniPopup();
    });

    // click outside popup to close
    this.popupBg.setInteractive();
    this.popupBg.on("pointerdown", (pointer) => {
        // only close if click is outside the popup box
        const bounds = this.popupBox.getBounds();
        if (!Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
            this.closeMiniPopup();
        }
    });

    // close on ESC key
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.once("down", () => this.closeMiniPopup());
  }

  closeMiniPopup() {
    if (!this.popupOpen) return;

    this.popupContainer?.destroy();

    this.popupBg = null;
    this.popupBox = null;
    this.popupText = null;
    this.popupTriangle = null;

    this.popupOpen = false;
    this.currentPopupObject = null;
  }

}

const gameCanvas = document.getElementById("gameCanvas");

const config = {
  /* set rendering exp. */
  type:Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas:gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity:{y:speedDown}
    }
  },
  scene: [GameScene]
}

const game = new Phaser.Game(config)


export function pauseGameInput() {
  gameScene.input.enabled = false;
}

export function resumeGameInput() {
  gameScene.input.enabled = true;
}