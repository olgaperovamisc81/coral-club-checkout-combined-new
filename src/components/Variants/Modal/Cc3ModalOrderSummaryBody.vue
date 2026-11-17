<script setup lang="ts">
import { computed } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryItems from './Cc3ModalOrderSummaryItems.vue'
import Cc3ModalOrderSummaryPromo from './Cc3ModalOrderSummaryPromo.vue'

/**
 * Тело сводки заказа: миниатюры, счётчик, суммы и промокод.
 *
 * Вынесено из Cc3ModalOrderSummary, потому что показывается в двух местах:
 * блоком в конце страницы и раскрытой панелью под прилипшей шапкой сводки.
 * Вид в обоих местах обязан совпадать — это одна и та же сводка, и две
 * слегка разные её версии человек прочитает как два разных заказа.
 */
defineProps<{
  /**
   * Плотная раскладка раскрытой панели под шапкой: в макете у неё строки
   * стоят ближе, чем у блока в конце страницы.
   */
  compact?: boolean
  /** Без миниатюр и числа товаров: остаются строки сумм. */
  hideItems?: boolean
  /** Без поля промокода: комбинированная версия ставит его в отдельную карточку. */
  hidePromo?: boolean
}>()

const { t } = useStand()
const { summary } = useCheckout()

const text = computed(() => ({
  subtotal: t('summary.items', { count: summary.value.itemsCount }),
  shipping: t('summary.delivery'),
  total: t('summary.total'),
  promoRow: t('summary.promoRow'),
}))
</script>

<template>
  <div
    class="cc3-modal-order-summary-body"
    :class="{ 'cc3-modal-order-summary-body--compact': compact }"
  >
    <Cc3ModalOrderSummaryItems v-if="!hideItems" />

    <dl class="cc3-modal-order-summary-body__rows">
      <div class="cc3-modal-order-summary-body__row">
        <dt>{{ text.subtotal }}</dt>
        <dd>{{ summary.itemsTotalFormatRounded }}</dd>
      </div>

      <div class="cc3-modal-order-summary-body__row">
        <dt>{{ text.shipping }}</dt>
        <dd>{{ summary.deliveryFormatRounded }}</dd>
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
    </dl>

    <div v-if="!hidePromo" class="cc3-modal-order-summary-body__promo">
      <Cc3ModalOrderSummaryPromo />
    </div>
  </div>
</template>

<style lang="scss">
.cc3-modal-order-summary-body {
  // Плотная раскладка по макету панели: миниатюры ниже края шапки, строки
  // через 8px, промокод отодвинут от итога.
  &--compact {
    .cc3-modal-order-summary-items__preview {
      padding: calc(var(--st-global-distance-space-inset-2xl) + var(--st-global-distance-space-inset-md))
        var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-md);
    }

    .cc3-modal-order-summary-items__count {
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
