<script setup lang="ts">
import Cc3ModalOrderSummaryBody from '../Modal/Cc3ModalOrderSummaryBody.vue'
import Cc3CombinedExtras from './Cc3CombinedExtras.vue'
import Cc3CombinedOrderItems from './Cc3CombinedOrderItems.vue'

/**
 * Серая карточка сводки: плитки товаров, строка с числом товаров и баллами,
 * строки сумм и итог, под ним Coral Wallet и промокод. Стоит и
 * внизу страницы на телефоне, и справа на десктопе.
 */
defineProps<{
  /** Способ доставки ещё не выбран: в строке доставки прочерк. */
  deliveryUnknown?: boolean
}>()
</script>

<template>
  <section class="cc3-combined-total-card">
    <Cc3CombinedOrderItems />

    <Cc3ModalOrderSummaryBody hide-items hide-promo :delivery-unknown="deliveryUnknown">
      <template #extras>
        <Cc3CombinedExtras />
      </template>
    </Cc3ModalOrderSummaryBody>
  </section>
</template>

<style lang="scss">
.cc3-combined-total-card {
  @include cc3-combined-summary-card;

  // Строки сумм, итог и блок под ним стоят на 2px теснее, чем в общей сводке.
  .cc3-modal-order-summary-body__rows {
    gap: calc(var(--st-global-distance-space-inset-2xl) - 2px);
  }
}

.cc3-combined-total-card .cc3-combined-extras {
  gap: calc(var(--st-global-distance-space-inset-2xl) - 2px);
}
</style>
