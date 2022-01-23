import { Constructor, dedupeMixin } from '@open-wc/dedupe-mixin';
import { LitElement } from 'lit';
import { $ } from '@mdui/jq/$.js';
import '@mdui/jq/methods/on.js';
import '@mdui/jq/methods/off.js';
import {
  register,
  isAllow,
  startEvent,
  unlockEvent,
  endEvent,
  cancelEvent,
} from '@mdui/shared/src/helpers/touchHandler';
import { MduiRipple } from './index.js';

export const RippleMixin = dedupeMixin(
  <T extends Constructor<LitElement>>(
    superclass: T,
  ): T & Constructor<LitElement> => {
    class Mixin extends superclass {
      protected rippleTarget!: HTMLElement;
      protected rippleElement!: MduiRipple;

      protected canRun(event: Event): boolean {
        if (isAllow(event)) {
          register(event);

          return true;
        }

        return false;
      }

      protected startPress(event: Event): void {
        if (!this.canRun(event)) {
          return;
        }

        const $rippleTarget = $(this.rippleTarget);

        // 手指触摸触发涟漪
        if (event.type === 'touchstart') {
          let hidden = false;

          // 手指触摸后，延迟一段时间触发涟漪，避免手指滑动时也触发涟漪
          let timer = setTimeout(() => {
            timer = 0;
            this.rippleElement.startPress(event);
          }, 70) as unknown as number;

          const hideRipple = () => {
            // 如果手指没有移动，且涟漪动画还没有开始，则开始涟漪动画
            if (timer) {
              clearTimeout(timer);
              timer = 0;
              this.rippleElement.startPress(event);
            }

            if (!hidden) {
              hidden = true;
              this.rippleElement.endPress();
            }

            $rippleTarget.off('touchend touchcancel', hideRipple);
          };

          // 手指移动后，移除涟漪动画
          const touchMove = (): void => {
            if (timer) {
              clearTimeout(timer);
              timer = 0;
            }

            $rippleTarget.off('touchmove', touchMove);
          };

          $rippleTarget
            .on('touchmove', touchMove)
            .on('touchend touchcancel', hideRipple);
        }

        // 鼠标点击触发涟漪，点击后立即触发涟漪（鼠标右键不触发涟漪）
        if (event.type === 'mousedown' && (event as MouseEvent).button !== 2) {
          const hideRipple = () => {
            this.rippleElement.endPress();
            $rippleTarget.off(`${endEvent} ${cancelEvent}`, hideRipple);
          };

          this.rippleElement.startPress(event);
          $rippleTarget.on(`${endEvent} ${cancelEvent}`, hideRipple);
        }
      }

      protected endPress(event: Event): void {
        if (this.canRun(event)) {
          this.rippleElement.endPress();
        }
      }

      protected startHover(event: Event): void {
        if (this.canRun(event)) {
          this.rippleElement.startHover();
        }
      }

      protected endHover(event: Event): void {
        if (this.canRun(event)) {
          this.rippleElement.endHover();
        }
      }

      protected startFocus(event: Event): void {
        if (this.canRun(event)) {
          this.rippleElement.startFocus();
        }
      }

      protected endFocus(event: Event): void {
        if (this.canRun(event)) {
          this.rippleElement.endFocus();
        }
      }

      protected startDrag(event: Event): void {
        if (this.canRun(event)) {
          this.rippleElement.startDrag();
        }
      }

      protected endDrag(event: Event): void {
        if (this.canRun(event)) {
          this.rippleElement.endDrag();
        }
      }

      protected async firstUpdated() {
        $(this.rippleTarget)
          .on(startEvent, (e) => this.startPress(e))
          .on('mouseenter', (e) => this.startHover(e))
          .on('mouseleave', (e) => this.endHover(e))
          .on(unlockEvent, register);
      }
    }

    return Mixin;
  },
);
