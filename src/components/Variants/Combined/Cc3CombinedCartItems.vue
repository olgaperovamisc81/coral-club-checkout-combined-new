<script setup lang="ts">
import { computed } from 'vue'

import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryItems from '../Modal/Cc3ModalOrderSummaryItems.vue'

/**
 * Товары заказа отдельным блоком над серой карточкой с суммами: заголовок
 * «Ваши товары», миниатюры и строка с числом товаров и баллами. Вынесены из
 * карточки, чтобы серое не лежало на сером. На широком экране заголовок
 * скрывает страница: товары там стоят в правой колонке без него.
 */
const { t } = useStand()

const text = computed(() => ({
  title: t('summary.yourItems'),
}))
</script>

<template>
  <section class="cc3-combined-cart-items">
    <h2 class="cc3-combined-cart-items__title">{{ text.title }}</h2>

    <Cc3ModalOrderSummaryItems />
  </section>
</template>

<style lang="scss">
.cc3-combined-cart-items {
  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl)
      calc(var(--st-global-distance-space-inset-xl) + var(--st-global-distance-space-inset-x));

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  // Описание под миниатюрами мельче строк сумм: 14, как остальные описания.
  .cc3-modal-order-summary-items__count {
    @include font('body-sm');
  }
}
</style>
