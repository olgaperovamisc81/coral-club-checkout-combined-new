<script setup lang="ts">
import { computed } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryPromo from './Cc3ModalOrderSummaryPromo.vue'

/**
 * Тело сводки заказа: миниатюры, счётчик, суммы и промокод.
 *
 * Вынесено из Cc3ModalOrderSummary, потому что показывается в двух местах:
 * блоком в конце страницы и раскрытой панелью под прилипшей шапкой сводки.
 * Вид в обоих местах обязан совпадать — это одна и та же сводка, и две
 * слегка разные её версии человек прочитает как два разных заказа.
 */
const props = defineProps<{
  /**
   * Плотная раскладка раскрытой панели под шапкой: в макете у неё строки
   * стоят ближе, чем у блока в конце страницы.
   */
  compact?: boolean
  /** Без миниатюр и числа товаров: комбинированная версия рисует их своим блоком. */
  hideItems?: boolean
  /** Без поля промокода: комбинированная версия ставит его в отдельную карточку. */
  hidePromo?: boolean
  /** Поле промокода с подписью внутри (комбинированная версия). */
  floatingPromo?: boolean
  /** Способ доставки ещё не выбран: цены нет, в строке доставки прочерк вместо «Бесплатно». */
  deliveryUnknown?: boolean
}>()

const { t } = useStand()
const { summary, orderProductsPreview } = useCheckout()

// Прочерк — знак, а не текст: перевода у него нет.
const DELIVERY_UNKNOWN = '—'

const deliveryValue = computed(() =>
  props.deliveryUnknown ? DELIVERY_UNKNOWN : summary.value.deliveryFormatRounded,
)

const text = computed(() => ({
  subtotal: t('summary.items', { count: summary.value.itemsCount }),
  shipping: t('summary.delivery'),
  total: t('summary.total'),
  itemsPoints: t('summary.itemsPoints', {
    count: summary.value.itemsCount,
    points: summary.value.points,
  }),
  promoRow: t('summary.promoRow'),
}))
</script>

<template>
  <div
    class="cc3-modal-order-summary-body"
    :class="{ 'cc3-modal-order-summary-body--compact': compact }"
  >
    <!--
      Раньше превью было кнопкой со стрелкой «раскрыть список товаров», но
      обработчика у неё не было: человек жал и ничего не происходило. Состав
      заказа теперь виден целиком — три позиции, — и раскрывать нечего.
    -->
    <div v-if="!hideItems" class="cc3-modal-order-summary-body__preview">
      <span class="cc3-modal-order-summary-body__thumbs">
        <span
          v-for="product in orderProductsPreview"
          :key="product.id"
          class="cc3-modal-order-summary-body__thumb"
        >
          <img
            v-if="product.thumbImage"
            :src="product.thumbImage"
            :alt="product.name"
            class="cc3-modal-order-summary-body__thumb-img"
          />
        </span>
      </span>
    </div>

    <p v-if="!hideItems" class="cc3-modal-order-summary-body__count">
      {{ text.itemsPoints }}
    </p>

    <dl class="cc3-modal-order-summary-body__rows">
      <div class="cc3-modal-order-summary-body__row">
        <dt>{{ text.subtotal }}</dt>
        <dd>{{ summary.itemsTotalFormatRounded }}</dd>
      </div>

      <div class="cc3-modal-order-summary-body__row">
        <dt>{{ text.shipping }}</dt>
        <dd>{{ deliveryValue }}</dd>
      </div>

      <div
        v-if="summary.walletUsedFormatRounded"
        class="cc3-modal-order-summary-body__row cc3-modal-order-summary-body__row--positive"
      >
        <dt>Coral Wallet</dt>
        <dd>-{{ summary.walletUsedFormatRounded }}</dd>
      </div>

      <div
        v-if="summary.promoDiscountFormatRounded"
        class="cc3-modal-order-summary-body__row cc3-modal-order-summary-body__row--positive-value"
      >
        <dt>{{ text.promoRow }}</dt>
        <dd>-{{ summary.promoDiscountFormatRounded }}</dd>
      </div>

      <div
        class="cc3-modal-order-summary-body__row cc3-modal-order-summary-body__row--total"
      >
        <dt>{{ text.total }}</dt>
        <dd>{{ summary.totalFormatRounded }}</dd>
      </div>

      <!-- Место для блока под итогом (комбинированная версия ставит сюда кошелёк и промокод). -->
      <slot name="extras" />
    </dl>

    <div v-if="!hidePromo" class="cc3-modal-order-summary-body__promo">
      <Cc3ModalOrderSummaryPromo :floating="floatingPromo" />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-modal-order-summary-body {
  // Плотная раскладка по макету панели: миниатюры ниже края шапки, строки
  // через 8px, промокод отодвинут от итога.
  &--compact {
    .cc3-modal-order-summary-body__preview {
      padding: calc(var(--st-global-distance-space-inset-2xl) + var(--st-global-distance-space-inset-md))
        var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-md);
    }

    .cc3-modal-order-summary-body__count {
      padding-bottom: var(--st-global-distance-space-inset-lg);
    }

    .cc3-modal-order-summary-body__rows {
      gap: var(--st-global-distance-space-inset-md);

      padding-bottom: var(--st-global-distance-space-inset-lg);
    }

    .cc3-modal-order-summary-body__promo {
      padding-top: var(--st-global-distance-space-inset-2xl);
      padding-bottom: calc(var(--st-global-distance-space-inset-2xl) + var(--st-global-distance-space-inset-lg));
    }
  }

  &__preview {
    display: flex;
    align-items: center;

    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);
    width: 100%;
  }

  &__thumbs {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-2xl);
  }

  &__thumb {
    display: flex;
    flex-shrink: 0;

    width: 64px;
    height: 64px;

    background-color: #f6f6f6;
    border: 1px solid var(--st-content-border-color-neutral-implicit);
    border-radius: var(--st-global-radius-x);
  }

  &__thumb-img {
    width: 100%;
    height: 100%;

    border-radius: var(--st-global-radius-x);
    object-fit: cover;
  }

  &__count {
    margin: 0;
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-2xl);

    margin: 0;
    padding: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl);
  }

  &__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    dt,
    dd {
      margin: 0;

      @include font('body-md');

      color: var(--st-content-foreground-color-neutral-primary);
    }
  }

  &__row--positive {
    dt,
    dd {
      color: var(--st-content-foreground-color-positive-secondary);
      font-weight: 700;
    }
  }

  // Строка промокода: подпись обычная, сумма скидки зелёная, как у кошелька.
  &__row--positive-value dd {
    color: var(--st-content-foreground-color-positive-secondary);
    font-weight: 700;
  }

  &__row--total {
    dt,
    dd {
      @include font('heading-xxs');
    }
  }

  &__promo {
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);
  }
}
</style>
