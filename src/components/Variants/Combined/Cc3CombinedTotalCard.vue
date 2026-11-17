<script setup lang="ts">
import Cc3ModalOrderSummaryBody from '../Modal/Cc3ModalOrderSummaryBody.vue'

/**
 * Карточка сводки внизу страницы на телефоне и планшете: миниатюры товаров,
 * их число и баллы, строки сумм и итог. Без кошелька и промокода — они стоят
 * в своей карточке ниже. С двух колонок её заменяет сводка справа.
 */
</script>

<template>
  <section class="cc3-combined-total-card">
    <Cc3ModalOrderSummaryBody hide-promo />
  </section>
</template>

<style lang="scss">
.cc3-combined-total-card {
  @include cc3-combined-summary-card;
}
</style>
