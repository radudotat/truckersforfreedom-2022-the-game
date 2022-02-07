import { useEffect, useRef } from 'react';
import kaboom from '../node_modules/kaboom/dist/kaboom.mjs';
import explode from './sounds/explode.mp3';
import hit from './sounds/hit.mp3';
import OtherworldlyFoe from './sounds/OtherworldlyFoe.mp3';
import shoot from './sounds/shoot.mp3';
import stars from './sprites/pizza.png';
import barroso from './svg/Barroso.png';
import gates from './svg/Gates.png';
import macron from './svg/Macron.png';
import morrison from './svg/Morrison.png';
import nehammer from './svg/Nehammer.png';
import schallenberg from './svg/Schallenberg.png';
import truckers from './svg/truckers.png';
import trudeau from './svg/Trudeau.png';
import vonDerLeyen from './svg/VonDerLeyen.png';

function App() {
  const canvasRef = useRef(null);

  // just make sure this is only run once on mount so your game state is not messed up
  useEffect(() => {
    document.title = 'TruckersForFreedom2022 - The Game!';
    const k = kaboom({
      // if you don't want to import to the global namespace
      global: false,
      // if you don't want kaboom to create a canvas and insert under document.body
      canvas: canvasRef.current,
      background: [255, 255, 255],
    });

    const objs = [
      'nehammer',
      'macron',
      'trudeau',
      'vonDerLeyen',
      'barroso',
      'schallenberg',
      'gates',
      'morrison',
    ];
    k.loadSprite('nehammer', nehammer);
    k.loadSprite('macron', macron);
    k.loadSprite('trudeau', trudeau);
    k.loadSprite('vonDerLeyen', vonDerLeyen);
    k.loadSprite('barroso', barroso);
    k.loadSprite('schallenberg', schallenberg);
    k.loadSprite('gates', gates);
    k.loadSprite('morrison', morrison);
    k.loadSprite('stars', stars);

    // k.loadBean();
    k.loadSprite('bean', truckers);

    k.loadSound('hit', hit);
    k.loadSound('shoot', shoot);
    k.loadSound('explode', explode);
    k.loadSound('OtherworldlyFoe', OtherworldlyFoe);

    k.scene('battle', () => {
      const BULLET_SPEED = 1200;
      const TRASH_SPEED = 120;
      const BOSS_SPEED = 48;
      const PLAYER_SPEED = 480;
      // const STAR_SPEED = 120;
      const BOSS_HEALTH = 1000;
      const OBJ_HEALTH = 4;

      const assholeName = k.choose(objs);

      let insaneMode = false;

      const music = k.play('OtherworldlyFoe');

      k.volume(0.5);

      function grow(rate) {
        return {
          update() {
            const n = rate * k.dt();
            this.scale.x += n;
            this.scale.y += n;
          },
        };
      }

      function late(t) {
        let timer = 0;
        return {
          add() {
            this.hidden = true;
          },
          update() {
            timer += k.dt();
            if (timer >= t) {
              this.hidden = false;
            }
          },
        };
      }

      function addExplode(p, n, rad, size) {
        for (let i = 0; i < n; i++) {
          k.wait(k.rand(n * 0.1), () => {
            for (let i = 0; i < 2; i++) {
              k.add([
                k.pos(p.add(k.rand(k.vec2(-rad), k.vec2(rad)))),
                k.rect(4, 4),
                k.outline(4),
                k.scale(1 * size, 1 * size),
                k.lifespan(0.1),
                grow(k.rand(48, 72) * size),
                k.origin('center'),
              ]);
            }
          });
        }
      }

      function spawnBullet(p) {
        k.add([
          k.rect(12, 48),
          k.area(),
          k.pos(p),
          k.origin('center'),
          k.color(127, 127, 255),
          k.outline(4),
          k.move(k.UP, BULLET_SPEED),
          k.cleanup(),
          // strings here means a tag
          'bullet',
        ]);
      }

      k.add([
        k.text('BOOSTERIZE', { size: 160 }),
        k.pos(k.width() / 2, k.height() / 2),
        k.origin('center'),
        k.lifespan(1),
        k.fixed(),
      ]);

      k.add([
        k.text('THE', { size: 80 }),
        k.pos(k.width() / 2, k.height() / 2),
        k.origin('center'),
        k.lifespan(2),
        late(1),
        k.fixed(),
      ]);

      k.add([
        k.text(assholeName.toUpperCase(), { size: 120 }),
        k.pos(k.width() / 2, k.height() / 2),
        k.origin('center'),
        k.lifespan(4),
        late(2),
        k.fixed(),
      ]);

      const sky = k.add([
        k.rect(k.width(), k.height()),
        k.color(0, 0, 0),
        k.opacity(0),
      ]);

      sky.onUpdate(() => {
        if (insaneMode) {
          const t = k.time() * 10;
          sky.color.r = k.wave(127, 255, t);
          sky.color.g = k.wave(127, 255, t + 1);
          sky.color.b = k.wave(127, 255, t + 2);
          sky.opacity = 1;
        } else {
          sky.color = k.rgb(0, 0, 0);
          sky.opacity = 0;
        }
      });

      // k.add([
      // 	k.sprite("stars"),
      // 	k.scale(k.width() / 240,k.height() / 240),
      // 	k.pos(0, 0),
      // 		"stars",
      // 	])
      //
      // k.add([
      // 	k.sprite("stars"),
      // 	k.scale(k.width() / 240,k.height() / 240),
      // 	k.pos(0, -k.height()),
      // 		"stars",
      // 	])
      //
      // k.onUpdate("stars", (r) => {
      // 		r.move(0, STAR_SPEED * (insaneMode ? 10 : 1))
      // 		if (r.pos.y >=k.height()) {
      // 			r.pos.y -=k.height() * 2
      // 		}
      // 	})

      const player = k.add([
        k.sprite('bean'),
        k.area(),
        k.pos(k.width() / 2, k.height() - 64),
        k.origin('center'),
      ]);

      k.onKeyDown('left', () => {
        player.move(-PLAYER_SPEED, 0);
        if (player.pos.x < 0) {
          player.pos.x = k.width();
        }
      });

      k.onKeyDown('right', () => {
        player.move(PLAYER_SPEED, 0);
        if (player.pos.x > k.width()) {
          player.pos.x = 0;
        }
      });

      k.onKeyPress('up', () => {
        insaneMode = true;
        music.speed(2);
      });

      k.onKeyRelease('up', () => {
        insaneMode = false;
        music.speed(1);
      });

      player.onCollide('enemy', (e) => {
        k.destroy(e);
        k.destroy(player);
        k.shake(120);
        k.play('explode');
        music.detune(-1200);
        addExplode(k.center(), 12, 120, 30);
        k.wait(1, () => {
          music.stop();
          k.go('battle');
        });
      });

      k.onUpdate('bullet', (b) => {
        if (insaneMode) {
          b.color = k.rand(k.rgb(0, 0, 0), k.rgb(255, 255, 255));
        }
      });

      k.onKeyPress('space', () => {
        spawnBullet(player.pos.add(16, 0));
        setTimeout(() => {
          spawnBullet(player.pos.add(0, -16));
        }, 100);
        spawnBullet(player.pos.add(-16, 0));
        k.play('shoot', {
          volume: 0.3,
          detune: k.rand(-1200, 1200),
        });
      });

      function spawnTrash() {
        const name = k.choose(objs.filter((n) => n !== assholeName));
        k.add([
          k.sprite(name),
          k.area(),
          k.pos(k.rand(0, k.width()), 0),
          k.health(OBJ_HEALTH),
          k.origin('bot'),
          'trash',
          'enemy',
          { speed: k.rand(TRASH_SPEED * 0.5, TRASH_SPEED * 1.5) },
        ]);
        k.wait(insaneMode ? 0.1 : 0.3, spawnTrash);
      }

      const asshole = k.add([
        k.sprite(assholeName),
        k.area(),
        k.pos(k.width() / 2, 40),
        k.health(BOSS_HEALTH),
        k.scale(3),
        k.origin('top'),
        'enemy',
        {
          dir: 1,
        },
      ]);

      k.on('death', 'enemy', (e) => {
        k.destroy(e);
        k.shake(2);
        k.addKaboom(e.pos);
      });

      k.on('hurt', 'enemy', (e) => {
        k.shake(1);
        k.play('hit', {
          detune: k.rand(-1200, 1200),
          speed: k.rand(0.2, 2),
        });
      });

      const timer = k.add([k.text(0), k.pos(12, 32), k.fixed(), { time: 0 }]);

      timer.onUpdate(() => {
        timer.time += k.dt();
        timer.text = timer.time.toFixed(2);
      });

      k.onCollide('bullet', 'enemy', (b, e) => {
        k.destroy(b);
        e.hurt(insaneMode ? 10 : 1);
        addExplode(b.pos, 1, 24, 1);
      });

      k.onUpdate('trash', (t) => {
        t.move(0, t.speed * (insaneMode ? 5 : 1));
        if (t.pos.y - t.height > k.height()) {
          k.destroy(t);
        }
      });

      asshole.onUpdate((p) => {
        asshole.move(BOSS_SPEED * asshole.dir * (insaneMode ? 3 : 1), 0);
        if (asshole.dir === 1 && asshole.pos.x >= k.width() - 20) {
          asshole.dir = -1;
        }
        if (asshole.dir === -1 && asshole.pos.x <= 20) {
          asshole.dir = 1;
        }
      });

      const myocarditis = k.add([
        k.rect(k.width(), 24),
        k.pos(0, 0),
        k.color(127, 255, 127),
        k.fixed(),
        {
          max: BOSS_HEALTH,
          set(hp) {
            this.width = (k.width() * hp) / this.max;
            this.flash = true;
          },
        },
      ]);

      asshole.onHurt(() => {
        myocarditis.set(asshole.hp());
      });

      asshole.onDeath(() => {
        music.stop();
        k.go('win', {
          time: timer.time,
          asshole: assholeName,
        });
      });

      myocarditis.onUpdate(() => {
        if (myocarditis.flash) {
          myocarditis.color = k.rgb(255, 255, 255);
          myocarditis.flash = false;
        } else {
          myocarditis.color = k.rgb(127, 255, 127);
        }
      });

      k.add([
        k.text('UP: insane mode', { width: k.width() / 2, size: 32 }),
        k.origin('botleft'),
        k.pos(24, k.height() - 24),
      ]);

      spawnTrash();
    });

    k.scene('win', ({ time, asshole }) => {
      const b = k.burp({
        loop: true,
      });

      k.loop(0.5, () => {
        b.detune(k.rand(-1200, 1200));
      });

      k.add([
        k.sprite(asshole),
        k.color(255, 0, 0),
        k.origin('center'),
        k.scale(8),
        k.pos(k.width() / 2, k.height() / 2),
      ]);

      k.add([
        k.text(time.toFixed(2), 24),
        k.origin('center'),
        k.pos(k.width() / 2, k.height() / 2),
      ]);
    });

    k.go('battle');
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}
export default App;
