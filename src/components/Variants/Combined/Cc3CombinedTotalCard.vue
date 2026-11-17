<script setup lang="ts">
import Cc3ModalOrderSummaryBody from '../Modal/Cc3ModalOrderSummaryBody.vue'
import Cc3CombinedOrderItems from './Cc3CombinedOrderItems.vue'

/**
 * Серая карточка сводки: плитки товаров, строка с числом товаров и баллами,
 * строки сумм и итог. Без кошелька и промокода — они стоят в своей карточке
 * ниже, только с обводкой. Стоит и внизу страницы на телефоне, и справа на
 * десктопе.
 */
</script>

<template>
  <section class="cc3-combined-total-card">
    <Cc3CombinedOrderItems />

    <Cc3ModalOrderSummaryBody hide-items hide-promo />
  </section>
</template>

<style lang="scss">
.cc3-combined-total-card {
  @include cc3-combined-summary-card;
}
</style>
