import type { CSSResultGroup, TemplateResult } from 'lit';
import { html, LitElement, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { FocusableMixin } from '@mdui/shared/mixins/focusable.js';
import { AnchorMixin } from '@mdui/shared/mixins/anchor.js';
import { componentStyle } from '@mdui/shared/lit-styles/component-style.js';
import { HasSlotController } from '@mdui/shared/controllers/has-slot.js';
import { when } from 'lit/directives/when.js';
import { uniqueId } from '@mdui/shared/helpers/uniqueId.js';
import type { Ripple } from '../ripple/index.js';
import type { MaterialIconsName } from '../icon.js';
import { RippleMixin } from '../ripple/ripple-mixin.js';
import { navigationBarItemStyle } from './navigation-bar-item-style.js';
import '../icon.js';

/**
 * @slot - 文本
 * @slot icon - 图标
 * @slot activeIcon - 激活状态的图标
 * @slot badge - 徽标
 *
 * @event click - 点击时触发
 * @event focus - 获得焦点时触发
 * @event blur - 失去焦点时触发
 *
 * @csspart label - 文本
 * @csspart icon - 图标
 * @csspart active-icon - 激活状态的图标
 *
 * @cssprop --shape-corner-indicator 指示器的圆角大小。可以指定一个具体的像素值；但更推荐[引用系统变量]()
 */
@customElement('mdui-navigation-bar-item')
export class NavigationBarItem extends AnchorMixin(
  RippleMixin(FocusableMixin(LitElement)),
) {
  static override styles: CSSResultGroup = [
    componentStyle,
    navigationBarItemStyle,
  ];

  /**
   * 文本的可视状态，由 `navigation-bar` 调用
   */
  @property({ reflect: true, attribute: 'label-visibility' })
  protected labelVisibility!: 'selected' | 'labeled' | 'unlabeled';

  @query('mdui-ripple', true)
  protected rippleElement!: Ripple;

  private readonly hasSlotController = new HasSlotController(
    this,
    'activeIcon',
  );

  // 每一个 `navigation-bar-item` 元素都添加一个唯一的 key
  protected readonly key = uniqueId();

  protected get focusDisabled(): boolean {
    return this.disabled;
  }

  protected get focusElement(): HTMLElement {
    return this.href ? this.renderRoot.querySelector('._a')! : this;
  }

  protected get rippleDisabled(): boolean {
    return this.disabled;
  }

  // 是否禁用该元素，该组件没有禁用状态
  @state() protected disabled = false;

  /**
   * 是否为激活状态，由 navigation-bar 组件控制该参数
   */
  @property({ type: Boolean, reflect: true }) protected active = false;

  /**
   * 未激活状态的 Material Icons 图标名
   */
  @property({ reflect: true })
  public icon!: MaterialIconsName;

  /**
   * 激活状态的 Material Icons 图标名
   */
  @property({ reflect: true, attribute: 'active-icon' })
  public activeIcon!: MaterialIconsName;

  /**
   * 在导航项的值
   */
  @property({ reflect: true })
  public value = '';

  protected renderBadge(): TemplateResult | typeof nothing {
    return html`<slot name="badge"></slot>`;
  }

  protected renderActiveIcon(): TemplateResult {
    return html`<slot name="activeIcon">
      ${when(
        this.activeIcon,
        () => html`<mdui-icon
          part="active-icon"
          class="active-icon"
          name=${this.activeIcon}
        ></mdui-icon>`,
      )}
    </slot>`;
  }

  protected renderIcon(): TemplateResult {
    return html`<slot name="icon">
      ${when(
        this.icon,
        () =>
          html`<mdui-icon
            part="icon"
            class="icon"
            name=${this.icon}
          ></mdui-icon>`,
      )}
    </slot>`;
  }

  protected renderLabel(): TemplateResult {
    return html`<span part="label" class="label"><slot></slot></span>`;
  }

  protected renderInner(): TemplateResult {
    return html`<span
        class="indicator ${classMap({
          'has-active-icon':
            this.activeIcon || this.hasSlotController.test('activeIcon'),
        })}"
      >
        ${this.renderBadge()}${this.renderActiveIcon()}${this.renderIcon()}
      </span>
      ${this.renderLabel()}`;
  }

  protected override render(): TemplateResult {
    return html`<mdui-ripple></mdui-ripple>
      ${this.href
        ? // @ts-ignore
          this.renderAnchor({
            className: 'item',
            content: this.renderInner(),
          })
        : html`<span class="item">${this.renderInner()}</span>`} `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mdui-navigation-bar-item': NavigationBarItem;
  }
}
