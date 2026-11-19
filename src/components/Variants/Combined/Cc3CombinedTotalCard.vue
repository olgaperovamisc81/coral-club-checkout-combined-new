<script setup lang="ts">
import Cc3ModalOrderSummaryBody from '../Modal/Cc3ModalOrderSummaryBody.vue'
import Cc3CombinedExtras from './Cc3CombinedExtras.vue'
import Cc3CombinedOrderItems from './Cc3CombinedOrderItems.vue'

/**
 * Серая карточка сводки: плитки товаров, строка с числом товаров и баллами,
 * строки сумм, под ними Coral Wallet и промокод и итог последним. Стоит и
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
}
</style>
